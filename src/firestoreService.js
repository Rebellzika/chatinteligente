// Importe as funções necessárias do Firestore
import { 
    collection, 
    addDoc, 
    getDocs, 
    doc, 
    updateDoc, 
    serverTimestamp, 
    query, 
    orderBy, 
    onSnapshot,
    where,
    getDoc,
    setDoc,
    runTransaction,
    deleteDoc
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

import { db, auth } from './firebase-config.js';

// Função para obter o ID do usuário atual
const getCurrentUserId = () => {
    const user = auth.currentUser;
    console.log('🔍 getCurrentUserId chamado, auth.currentUser:', user);
    if (!user) {
        console.error('❌ Usuário não autenticado em getCurrentUserId');
        throw new Error('Usuário não autenticado');
    }
    console.log('✅ Usuário autenticado, UID:', user.uid);
    return user.uid;
};

// Função para criar índices automaticamente
async function createIndexIfNeeded(collectionName, fields) {
    try {
        // Tentar fazer uma consulta simples para verificar se o índice existe
        // Usar um userId real se disponível, senão usar 'test'
        const currentUser = auth.currentUser;
        const testUserId = currentUser ? currentUser.uid : 'test';
        
        console.log(`🔍 Testando consulta para ${collectionName} com userId: ${testUserId}`);
        
        const testQuery = query(
            collection(db, collectionName),
            where('userId', '==', testUserId),
            orderBy('createdAt', 'desc')
        );
        
        // Se não der erro, o índice já existe
        await getDocs(testQuery);
        console.log(`✅ Consulta para ${collectionName} funcionou perfeitamente`);
        return true;
        
    } catch (error) {
        console.log(`❌ Erro na consulta para ${collectionName}:`, error.message);
        
        if (error.message && error.message.includes('index')) {
            // Mostrar apenas uma mensagem clara e direta
            console.log(`⚠️ Índices necessários não encontrados. Crie em: https://console.firebase.google.com/v1/r/project/financeirochat-e3bf0/firestore/indexes`);
            return false;
        } else {
            // Mostrar outros tipos de erro para debug
            console.log(`🔍 Outro tipo de erro: ${error.message}`);
            return false;
        }
    }
}

// Função para inicializar índices necessários
export const initializeIndexes = async () => {
    try {
        // Verificar índice para contas
        const accountsIndexExists = await createIndexIfNeeded('accounts', ['userId', 'createdAt']);
        
        // Verificar índice para transações
        const transactionsIndexExists = await createIndexIfNeeded('transactions', ['userId', 'createdAt']);
        
        if (accountsIndexExists && transactionsIndexExists) {
            return true;
        } else {
            return false;
        }
        
    } catch (error) {
        return false;
    }
};

// Função para criar documento inicial do usuário
export const createUserDocument = async (userId, userEmail) => {
    try {
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);
        
        if (!userDoc.exists()) {
            await setDoc(userRef, {
                email: userEmail,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
            // Documento do usuário criado com sucesso
        }
    } catch (error) {
        console.error('Erro ao criar documento do usuário:', error);
        throw error;
    }
};

// Função para adicionar uma nova conta
export const addAccount = async (accountName, initialBalance) => {
    try {
        const userId = getCurrentUserId();
        console.log(`🔍 Criando conta: ${accountName} com saldo ${initialBalance} para userId: ${userId}`);
        
        const accountData = {
            name: accountName,
            balance: parseFloat(initialBalance),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            userId: userId
        };
        
        console.log(`📝 Dados da conta:`, accountData);
        
        const docRef = await addDoc(collection(db, 'accounts'), accountData);
        console.log(`✅ Conta criada com ID: ${docRef.id}`);
        
        // Conta criada com sucesso
        return docRef.id;
    } catch (error) {
        console.error('Erro ao criar conta:', error);
        throw error;
    }
};

// Função para buscar as contas do usuário em tempo real
export const onAccountsUpdate = (callback) => {
    try {
        const userId = getCurrentUserId();
        console.log(`🔍 Buscando contas para userId: ${userId}`);
        
        // Verificar se o usuário está autenticado
        if (!userId) {
            console.error('❌ Usuário não autenticado');
            callback([]);
            return null;
        }
        
        const accountsRef = collection(db, 'accounts');
        const q = query(
            accountsRef, 
            where('userId', '==', userId),
            orderBy('createdAt', 'desc')
        );
        
        console.log(`📝 Query criada:`, q);
        
        return onSnapshot(q, (snapshot) => {
            console.log(`📊 Snapshot recebido: ${snapshot.size} documentos`);
            
            const accounts = [];
            snapshot.forEach((doc) => {
                const accountData = doc.data();
                console.log(`📄 Documento ${doc.id}:`, accountData);
                accounts.push({
                    id: doc.id,
                    ...accountData
                });
            });
            
            console.log(`✅ Contas encontradas:`, accounts);
            callback(accounts);
        }, (error) => {
            console.error(`❌ Erro no listener de contas:`, error.message);
            console.error(`🔍 Código do erro:`, error.code);
            console.error(`🔍 Detalhes do erro:`, error);
            
            // Se for erro de permissões, tentar novamente após um delay
            if (error.code === 'permission-denied') {
                console.log(`⚠️ Erro de permissões, tentando novamente em 2 segundos...`);
                setTimeout(() => {
                    onAccountsUpdate(callback);
                }, 2000);
            }
        });
    } catch (error) {
        console.error('❌ Erro ao configurar listener de contas:', error);
        callback([]);
    }
};

// Função para validar se uma transação pode ser executada
export const validateTransaction = async (accountId, amount, type) => {
    try {
        const userId = getCurrentUserId();
        const accountRef = doc(db, 'accounts', accountId);
        const accountDoc = await getDoc(accountRef);
        
        if (!accountDoc.exists()) {
            throw new Error('Conta não encontrada');
        }
        
        const accountData = accountDoc.data();
        if (accountData.userId !== userId) {
            throw new Error('Acesso negado: conta não pertence ao usuário');
        }
        
        const currentBalance = accountData.balance || 0;
        let newBalance;
        
        if (type === 'expense' || type === 'transfer_out') {
            newBalance = currentBalance - amount;
            if (newBalance < 0) {
                throw new Error(`❌ Saldo insuficiente! A conta "${accountData.name}" tem apenas R$ ${currentBalance.toFixed(2)} disponível. Você precisa de R$ ${amount.toFixed(2)} para esta operação.`);
            }
        } else if (type === 'income' || type === 'transfer_in') {
            newBalance = currentBalance + amount;
        } else {
            throw new Error('Tipo de transação inválido');
        }
        
        return {
            isValid: true,
            currentBalance,
            newBalance,
            accountName: accountData.name
        };
        
    } catch (error) {
        console.error('Erro na validação da transação:', error);
        return {
            isValid: false,
            error: error.message
        };
    }
};

// Função para adicionar uma nova transação com validação de saldo
export const addTransaction = async (transactionData) => {
    try {
        const userId = getCurrentUserId();
        console.log(`🔍 Criando transação para userId: ${userId}`);
        console.log(`📝 Dados da transação:`, transactionData);
        
        let validation = null;
        
        // Validar saldo antes de criar a transação
        if (transactionData.type === 'expense' || transactionData.type === 'transfer_out') {
            validation = await validateTransaction(transactionData.accountId, transactionData.amount, transactionData.type);
            
            if (!validation.isValid) {
                throw new Error(validation.error);
            }
            
            console.log(`✅ Validação de saldo aprovada: ${validation.accountName} - Saldo atual: R$ ${validation.currentBalance.toFixed(2)}, Novo saldo: R$ ${validation.newBalance.toFixed(2)}`);
            
            // Atualizar o saldo da conta imediatamente após validação
            await updateAccountBalance(transactionData.accountId, validation.newBalance);
            console.log(`✅ Saldo da conta ${validation.accountName} atualizado para R$ ${validation.newBalance.toFixed(2)}`);
        }
        
        const transaction = {
            ...transactionData,
            userId: userId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };
        
        const docRef = await addDoc(collection(db, 'transactions'), transaction);
        console.log(`✅ Transação criada com sucesso, ID: ${docRef.id}`);
        
        // Retornar informações da transação criada
        return {
            id: docRef.id,
            ...transaction,
            validation: validation
        };
    } catch (error) {
        console.error('Erro ao criar transação:', error);
        throw error;
    }
};

// Função para buscar transações do usuário em tempo real
export const onTransactionsUpdate = (callback) => {
    try {
        const userId = getCurrentUserId();
        const transactionsRef = collection(db, 'transactions');
        const q = query(
            transactionsRef, 
            where('userId', '==', userId),
            orderBy('createdAt', 'desc')
        );
        
        return onSnapshot(q, (snapshot) => {
            const transactions = [];
            snapshot.forEach((doc) => {
                transactions.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            callback(transactions);
        }, (error) => {
            console.log(`🔍 Erro no listener de transações:`, error.message);
        });
    } catch (error) {
        console.error('Erro ao configurar listener de transações:', error);
        callback([]);
    }
};

// Função para atualizar o saldo de uma conta
export const updateAccountBalance = async (accountId, newBalance) => {
    try {
        console.log(`🔍 Atualizando saldo da conta ${accountId} para R$ ${newBalance}`);
        const accountRef = doc(db, 'accounts', accountId);
        await updateDoc(accountRef, {
            balance: parseFloat(newBalance),
            updatedAt: serverTimestamp()
        });
        console.log(`✅ Saldo da conta ${accountId} atualizado com sucesso para R$ ${newBalance}`);
        // Saldo da conta atualizado com sucesso
    } catch (error) {
        console.error('Erro ao atualizar saldo da conta:', error);
        throw error;
    }
};

// Função para contar transações de uma conta específica
export const countTransactionsByAccount = async (accountId) => {
    try {
        const userId = getCurrentUserId();
        console.log(`🔍 Contando transações da conta ${accountId} para userId: ${userId}`);
        
        // Buscar todas as transações da conta
        const transactionsRef = collection(db, 'transactions');
        const transactionsQuery = query(
            transactionsRef,
            where('userId', '==', userId),
            where('accountId', '==', accountId)
        );
        
        const transactionsSnapshot = await getDocs(transactionsQuery);
        const count = transactionsSnapshot.size;
        
        console.log(`📊 Conta ${accountId} possui ${count} transações`);
        return count;
        
    } catch (error) {
        console.error('Erro ao contar transações da conta:', error);
        throw error;
    }
};

// Função para remover todas as transações de uma conta específica
export const deleteTransactionsByAccount = async (accountId) => {
    try {
        const userId = getCurrentUserId();
        console.log(`🔍 Removendo transações da conta ${accountId} para userId: ${userId}`);
        
        // Buscar todas as transações da conta
        const transactionsRef = collection(db, 'transactions');
        const transactionsQuery = query(
            transactionsRef,
            where('userId', '==', userId),
            where('accountId', '==', accountId)
        );
        
        const transactionsSnapshot = await getDocs(transactionsQuery);
        
        if (transactionsSnapshot.empty) {
            console.log(`ℹ️ Nenhuma transação encontrada para a conta ${accountId}`);
            return 0;
        }
        
        const deletePromises = [];
        const transactionCount = transactionsSnapshot.size;
        
        transactionsSnapshot.forEach((doc) => {
            console.log(`🗑️ Deletando transação: ${doc.id}`);
            deletePromises.push(deleteDoc(doc.ref));
        });
        
        // Executar todas as exclusões
        await Promise.all(deletePromises);
        
        console.log(`✅ ${transactionCount} transações removidas da conta ${accountId}`);
        return transactionCount;
        
    } catch (error) {
        console.error('Erro ao remover transações da conta:', error);
        throw error;
    }
};

// Função para remover uma conta específica
export const deleteAccount = async (accountId, forceDelete = false) => {
    try {
        const userId = getCurrentUserId();
        console.log(`🔍 Removendo conta ${accountId} para userId: ${userId}`);
        
        // Primeiro, verificar se a conta pertence ao usuário
        const accountRef = doc(db, 'accounts', accountId);
        const accountDoc = await getDoc(accountRef);
        
        if (!accountDoc.exists()) {
            throw new Error('Conta não encontrada');
        }
        
        const accountData = accountDoc.data();
        if (accountData.userId !== userId) {
            throw new Error('Acesso negado: conta não pertence ao usuário');
        }
        
        // Verificar se há transações associadas a esta conta
        const transactionsRef = collection(db, 'transactions');
        const transactionsQuery = query(
            transactionsRef,
            where('userId', '==', userId),
            where('accountId', '==', accountId)
        );
        
        const transactionsSnapshot = await getDocs(transactionsQuery);
        
        if (!transactionsSnapshot.empty) {
            if (forceDelete) {
                console.log(`⚠️ Forçando remoção da conta ${accountId} com ${transactionsSnapshot.size} transações...`);
                // Remover todas as transações primeiro
                await deleteTransactionsByAccount(accountId);
            } else {
                throw new Error(`Não é possível remover uma conta que possui ${transactionsSnapshot.size} transações. Use forceDelete = true para remover automaticamente.`);
            }
        }
        
        // Remover a conta
        await deleteDoc(accountRef);
        console.log(`✅ Conta ${accountId} removida com sucesso`);
        
        return true;
    } catch (error) {
        console.error('Erro ao remover conta:', error);
        throw error;
    }
};

// Função para limpar dados de teste/desenvolvimento
export const clearTestData = async () => {
    try {
        const userId = getCurrentUserId();
        console.log(`🧹 Limpando dados de teste para userId: ${userId}`);
        
        // Buscar todas as transações do usuário
        const transactionsRef = collection(db, 'transactions');
        const transactionsQuery = query(
            transactionsRef,
            where('userId', '==', userId)
        );
        
        const transactionsSnapshot = await getDocs(transactionsQuery);
        const deletePromises = [];
        
        transactionsSnapshot.forEach((doc) => {
            console.log(`🗑️ Deletando transação: ${doc.id}`);
            deletePromises.push(deleteDoc(doc.ref));
        });
        
        // Buscar todas as contas do usuário
        const accountsRef = collection(db, 'accounts');
        const accountsQuery = query(
            accountsRef,
            where('userId', '==', userId)
        );
        
        const accountsSnapshot = await getDocs(accountsQuery);
        
        accountsSnapshot.forEach((doc) => {
            console.log(`🗑️ Deletando conta: ${doc.id}`);
            deletePromises.push(deleteDoc(doc.ref));
        });
        
        // Executar todas as exclusões
        await Promise.all(deletePromises);
        
        console.log(`✅ Dados de teste limpos com sucesso!`);
        return true;
        
    } catch (error) {
        console.error('Erro ao limpar dados de teste:', error);
        throw error;
    }
};

// Função para obter estatísticas financeiras
export const getFinancialStats = async () => {
    try {
        const userId = getCurrentUserId();
        
        // Buscar contas do usuário
        const accountsRef = collection(db, 'accounts');
        const accountsQuery = query(
            accountsRef,
            where('userId', '==', userId)
        );
        
        const accountsSnapshot = await getDocs(accountsQuery);
        let totalBalance = 0;
        
        accountsSnapshot.forEach((doc) => {
            const accountData = doc.data();
            totalBalance += accountData.balance || 0;
        });
        
        // Buscar transações do mês atual
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        
        const transactionsRef = collection(db, 'transactions');
        const transactionsQuery = query(
            transactionsRef,
            where('userId', '==', userId),
            where('createdAt', '>=', startOfMonth),
            where('createdAt', '<=', endOfMonth)
        );
        
        const transactionsSnapshot = await getDocs(transactionsQuery);
        let monthlyIncome = 0;
        let monthlyExpenses = 0;
        
        transactionsSnapshot.forEach((doc) => {
            const transactionData = doc.data();
            if (transactionData.type === 'income') {
                monthlyIncome += transactionData.amount || 0;
            } else if (transactionData.type === 'expense') {
                monthlyExpenses += transactionData.amount || 0;
            }
        });
        
        return {
            totalBalance,
            monthlyIncome,
            monthlyExpenses
        };
        
    } catch (error) {
        console.error('Erro ao obter estatísticas:', error);
        // Retornar valores padrão em caso de erro
        return {
            totalBalance: 0,
            monthlyIncome: 0,
            monthlyExpenses: 0
        };
    }
};

// Função para buscar transações de uma conta específica
export const getAccountTransactions = async (accountId) => {
    try {
        const userId = getCurrentUserId();
        const transactionsRef = collection(db, 'transactions');
        const q = query(
            transactionsRef, 
            where('userId', '==', userId),
            where('accountId', '==', accountId),
            orderBy('createdAt', 'desc')
        );
        
        const snapshot = await getDocs(q);
        const transactions = [];
        snapshot.forEach((doc) => {
            transactions.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        return transactions;
    } catch (error) {
        console.error('Erro ao buscar transações da conta:', error);
        return [];
    }
};

// Função para realizar transferência entre contas
export const performTransfer = async (fromAccountId, toAccountId, amount) => {
    try {
        const userId = getCurrentUserId();
        
        // Validar saldo antes de executar a transferência
        const validation = await validateTransaction(fromAccountId, amount, 'transfer_out');
        if (!validation.isValid) {
            throw new Error(validation.error);
        }
        
        console.log(`✅ Validação de transferência aprovada: ${validation.accountName} - Saldo atual: R$ ${validation.currentBalance.toFixed(2)}, Saldo após transferência: R$ ${validation.newBalance.toFixed(2)}`);
        
        // Usar transação do Firestore para garantir atomicidade
        const result = await runTransaction(db, async (transaction) => {
            // Ler os saldos atuais das duas contas
            const fromAccountRef = doc(db, 'accounts', fromAccountId);
            const toAccountRef = doc(db, 'accounts', toAccountId);
            
            const fromAccountDoc = await transaction.get(fromAccountRef);
            const toAccountDoc = await transaction.get(toAccountRef);
            
            if (!fromAccountDoc.exists() || !toAccountDoc.exists()) {
                throw new Error('Uma das contas não foi encontrada');
            }
            
            const fromAccount = fromAccountDoc.data();
            const toAccount = toAccountDoc.data();
            
            // Verificar se as contas pertencem ao usuário
            if (fromAccount.userId !== userId || toAccount.userId !== userId) {
                throw new Error('Acesso negado às contas');
            }
            
            // Verificar novamente o saldo (dupla verificação)
            if (fromAccount.balance < amount) {
                throw new Error(`❌ Saldo insuficiente na conta ${fromAccount.name}. Saldo atual: R$ ${fromAccount.balance.toFixed(2)}`);
            }
            
            // Calcular novos saldos
            const newFromBalance = fromAccount.balance - amount;
            const newToBalance = toAccount.balance + amount;
            
            // Atualizar saldos das contas
            transaction.update(fromAccountRef, {
                balance: newFromBalance,
                updatedAt: serverTimestamp()
            });
            
            transaction.update(toAccountRef, {
                balance: newToBalance,
                updatedAt: serverTimestamp()
            });
            
            return {
                fromAccountName: fromAccount.name,
                toAccountName: toAccount.name,
                fromAccountNewBalance: newFromBalance,
                toAccountNewBalance: newToBalance
            };
        });
        
        // Após a transação bem-sucedida, criar registro da transferência
        await addDoc(collection(db, 'transactions'), {
            description: `Transferência para ${result.toAccountName}`,
            amount: amount,
            type: 'transfer',
            accountId: fromAccountId,
            toAccountId: toAccountId,
            userId: userId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        
        // Transferência realizada com sucesso
        return result;
        
    } catch (error) {
        console.error('Erro ao realizar transferência:', error);
        throw error;
    }
};

// Funções para gerenciar contas recorrentes
export const addRecurringBill = async (billData) => {
    try {
        const userId = getCurrentUserId();
        const bill = {
            ...billData,
            userId: userId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };
        
        const docRef = await addDoc(collection(db, 'users', userId, 'recurring_bills'), bill);
        // Conta recorrente criada com sucesso
        return docRef.id;
    } catch (error) {
        console.error('Erro ao criar conta recorrente:', error);
        throw error;
    }
};

export const getRecurringBills = async () => {
    try {
        const userId = getCurrentUserId();
        const billsRef = collection(db, 'users', userId, 'recurring_bills');
        const q = query(billsRef, orderBy('dueDay', 'asc'));
        
        const snapshot = await getDocs(q);
        const bills = [];
        snapshot.forEach((doc) => {
            bills.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        return bills;
    } catch (error) {
        console.error('Erro ao buscar contas recorrentes:', error);
        return [];
    }
};

export const updateRecurringBill = async (billId, newData) => {
    try {
        const userId = getCurrentUserId();
        const billRef = doc(db, 'users', userId, 'recurring_bills', billId);
        
        await updateDoc(billRef, {
            ...newData,
            updatedAt: serverTimestamp()
        });
        
        // Conta recorrente atualizada com sucesso
    } catch (error) {
        console.error('Erro ao atualizar conta recorrente:', error);
        throw error;
    }
};

export const deleteRecurringBill = async (billId) => {
    try {
        const userId = getCurrentUserId();
        const billRef = doc(db, 'users', userId, 'recurring_bills', billId);
        
        await deleteDoc(billRef);
        // Conta recorrente removida com sucesso
    } catch (error) {
        console.error('Erro ao remover conta recorrente:', error);
        throw error;
    }
};

// Função para buscar transações por período de tempo
export const getTransactionsByDateRange = async (startDate, endDate) => {
    try {
        const userId = getCurrentUserId();
        const transactionsRef = collection(db, 'transactions');
        
        // IMPORTANTE: Esta consulta pode exigir um índice composto no Firestore
        // Se você receber um erro no console sobre índice necessário, crie um índice composto com:
        // Collection: transactions, Fields: userId (Ascending), createdAt (Ascending)
        const q = query(
            transactionsRef,
            where('userId', '==', userId),
            where('createdAt', '>=', startDate),
            where('createdAt', '<=', endDate),
            orderBy('createdAt', 'desc')
        );
        
        const snapshot = await getDocs(q);
        const transactions = [];
        
        snapshot.forEach((doc) => {
            transactions.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        // Transações encontradas
        return transactions;
        
    } catch (error) {
        console.error('Erro ao buscar transações por período:', error);
        
        // Erro de índice - silenciar no console
        
        throw error;
    }
};

// Função para reverter uma transação (desfazer)
export const reverseTransaction = async (transactionData) => {
    try {
        const userId = getCurrentUserId();
        
        // Usar transação do Firestore para garantir atomicidade
        const result = await runTransaction(db, async (transaction) => {
            if (transactionData.type === 'transfer') {
                // Para transferências, reverter os saldos das contas
                const fromAccountRef = doc(db, 'accounts', transactionData.fromAccountId);
                const toAccountRef = doc(db, 'accounts', transactionData.toAccountId);
                
                const fromAccountDoc = await transaction.get(fromAccountRef);
                const toAccountDoc = await transaction.get(toAccountRef);
                
                if (!fromAccountDoc.exists() || !toAccountDoc.exists()) {
                    throw new Error('Uma das contas não foi encontrada');
                }
                
                const fromAccount = fromAccountDoc.data();
                const toAccount = toAccountDoc.data();
                
                // Verificar se as contas pertencem ao usuário
                if (fromAccount.userId !== userId || toAccount.userId !== userId) {
                    throw new Error('Acesso negado às contas');
                }
                
                // Reverter os saldos
                const newFromBalance = fromAccount.balance + transactionData.amount;
                const newToBalance = toAccount.balance - transactionData.amount;
                
                transaction.update(fromAccountRef, {
                    balance: newFromBalance,
                    updatedAt: serverTimestamp()
                });
                
                transaction.update(toAccountRef, {
                    balance: newToBalance,
                    updatedAt: serverTimestamp()
                });
                
                return {
                    fromAccountName: fromAccount.name,
                    toAccountName: toAccount.name,
                    fromAccountNewBalance: newFromBalance,
                    toAccountNewBalance: newToBalance
                };
                
            } else {
                // Para despesas e receitas, reverter o saldo da conta
                const accountRef = doc(db, 'accounts', transactionData.accountId);
                const accountDoc = await transaction.get(accountRef);
                
                if (!accountDoc.exists()) {
                    throw new Error('Conta não encontrada');
                }
                
                const account = accountDoc.data();
                
                // Verificar se a conta pertence ao usuário
                if (account.userId !== userId) {
                    throw new Error('Acesso negado à conta');
                }
                
                let newBalance = account.balance;
                
                if (transactionData.type === 'expense') {
                    // Se era despesa, adicionar o dinheiro de volta
                    newBalance += transactionData.amount;
                } else if (transactionData.type === 'income') {
                    // Se era receita, subtrair o dinheiro
                    newBalance -= transactionData.amount;
                }
                
                transaction.update(accountRef, {
                    balance: newBalance,
                    updatedAt: serverTimestamp()
                });
                
                return {
                    accountName: account.name,
                    newBalance: newBalance
                };
            }
        });
        
        // Transação revertida com sucesso
        return result;
        
    } catch (error) {
        console.error('Erro ao reverter transação:', error);
        throw error;
    }
};

// Função para atualizar uma transação existente
export const updateTransaction = async (transactionId, newData) => {
    try {
        const userId = getCurrentUserId();
        const transactionRef = doc(db, 'transactions', transactionId);
        
        // Primeiro, buscar a transação atual para verificar se pertence ao usuário
        const transactionDoc = await getDoc(transactionRef);
        if (!transactionDoc.exists()) {
            throw new Error('Transação não encontrada');
        }
        
        const currentTransaction = transactionDoc.data();
        if (currentTransaction.userId !== userId) {
            throw new Error('Acesso negado à transação');
        }
        
        // Se o valor ou a conta mudaram, precisamos ajustar os saldos
        if (newData.amount !== undefined || newData.accountId !== undefined) {
            // Usar transação do Firestore para garantir atomicidade
            await runTransaction(db, async (transaction) => {
                // Reverter a transação atual
                let oldAccountId = currentTransaction.accountId;
                let oldAmount = currentTransaction.amount;
                let oldType = currentTransaction.type;
                
                // Se a conta mudou, usar a nova conta
                if (newData.accountId && newData.accountId !== oldAccountId) {
                    oldAccountId = newData.accountId;
                }
                
                // Se o valor mudou, usar o novo valor
                if (newData.amount !== undefined && newData.amount !== oldAmount) {
                    oldAmount = newData.amount;
                }
                
                // Ajustar saldo da conta antiga
                const oldAccountRef = doc(db, 'accounts', oldAccountId);
                const oldAccountDoc = await transaction.get(oldAccountRef);
                
                if (!oldAccountDoc.exists()) {
                    throw new Error('Conta não encontrada');
                }
                
                const oldAccount = oldAccountDoc.data();
                let oldAccountNewBalance = oldAccount.balance;
                
                if (oldType === 'expense') {
                    // Se era despesa, adicionar o dinheiro de volta
                    oldAccountNewBalance += oldAmount;
                } else if (oldType === 'income') {
                    // Se era receita, subtrair o dinheiro
                    oldAccountNewBalance -= oldAmount;
                }
                
                transaction.update(oldAccountRef, {
                    balance: oldAccountNewBalance,
                    updatedAt: serverTimestamp()
                });
                
                // Aplicar a nova transação
                let newAmount = newData.amount !== undefined ? newData.amount : currentTransaction.amount;
                let newAccountId = newData.accountId || currentTransaction.accountId;
                
                const newAccountRef = doc(db, 'accounts', newAccountId);
                const newAccountDoc = await transaction.get(newAccountRef);
                
                if (!newAccountDoc.exists()) {
                    throw new Error('Nova conta não encontrada');
                }
                
                const newAccount = newAccountDoc.data();
                let newAccountNewBalance = newAccount.balance;
                
                if (oldType === 'expense') {
                    // Se era despesa, subtrair o novo valor
                    newAccountNewBalance -= newAmount;
                } else if (oldType === 'income') {
                    // Se era receita, adicionar o novo valor
                    newAccountNewBalance += newAmount;
                }
                
                transaction.update(newAccountRef, {
                    balance: newAccountNewBalance,
                    updatedAt: serverTimestamp()
                });
            });
        }
        
        // Atualizar a transação com os novos dados
        await updateDoc(transactionRef, {
            ...newData,
            updatedAt: serverTimestamp()
        });
        
        // Transação atualizada com sucesso
        
    } catch (error) {
        console.error('Erro ao atualizar transação:', error);
        throw error;
    }
};



// Função para corrigir saldos negativos existentes
export const fixNegativeBalances = async () => {
    try {
        const userId = getCurrentUserId();
        console.log(`🔧 Verificando e corrigindo saldos negativos para userId: ${userId}`);
        
        const accountsRef = collection(db, 'accounts');
        const q = query(accountsRef, where('userId', '==', userId));
        const snapshot = await getDocs(q);
        
        let fixedCount = 0;
        const accountsToUpdate = [];
        
        snapshot.forEach((doc) => {
            const accountData = doc.data();
            if (accountData.balance < 0) {
                console.log(`⚠️ Saldo negativo encontrado: ${accountData.name} - R$ ${accountData.balance.toFixed(2)}`);
                accountsToUpdate.push({
                    id: doc.id,
                    name: accountData.name,
                    oldBalance: accountData.balance,
                    newBalance: 0
                });
            }
        });
        
        if (accountsToUpdate.length === 0) {
            console.log(`✅ Nenhum saldo negativo encontrado`);
            return { fixed: 0, message: 'Nenhum saldo negativo encontrado' };
        }
        
        // Atualizar todas as contas com saldo negativo para 0
        for (const account of accountsToUpdate) {
            await updateAccountBalance(account.id, 0);
            console.log(`✅ Saldo corrigido: ${account.name} - De R$ ${account.oldBalance.toFixed(2)} para R$ 0.00`);
            fixedCount++;
        }
        
        console.log(`✅ ${fixedCount} saldos negativos corrigidos com sucesso`);
        return {
            fixed: fixedCount,
            message: `${fixedCount} saldos negativos corrigidos`,
            accounts: accountsToUpdate
        };
        
    } catch (error) {
        console.error('Erro ao corrigir saldos negativos:', error);
        throw error;
    }
};

// Função para verificar integridade dos dados financeiros
export const checkFinancialIntegrity = async () => {
    try {
        const userId = getCurrentUserId();
        console.log(`🔍 Verificando integridade financeira para userId: ${userId}`);
        
        const accountsRef = collection(db, 'accounts');
        const transactionsRef = collection(db, 'transactions');
        
        // Buscar contas
        const accountsQuery = query(accountsRef, where('userId', '==', userId));
        const accountsSnapshot = await getDocs(accountsQuery);
        
        // Buscar transações
        const transactionsQuery = query(transactionsRef, where('userId', '==', userId));
        const transactionsSnapshot = await getDocs(transactionsQuery);
        
        const accounts = [];
        const transactions = [];
        
        accountsSnapshot.forEach((doc) => {
            accounts.push({ id: doc.id, ...doc.data() });
        });
        
        transactionsSnapshot.forEach((doc) => {
            transactions.push({ id: doc.id, ...doc.data() });
        });
        
        // Calcular saldos teóricos baseados nas transações
        const theoreticalBalances = {};
        accounts.forEach(account => {
            theoreticalBalances[account.id] = 0;
        });
        
        transactions.forEach(transaction => {
            if (transaction.accountId && theoreticalBalances.hasOwnProperty(transaction.accountId)) {
                if (transaction.type === 'income') {
                    theoreticalBalances[transaction.accountId] += transaction.amount;
                } else if (transaction.type === 'expense') {
                    theoreticalBalances[transaction.accountId] -= transaction.amount;
                } else if (transaction.type === 'transfer') {
                    theoreticalBalances[transaction.accountId] -= transaction.amount;
                    if (transaction.toAccountId && theoreticalBalances.hasOwnProperty(transaction.toAccountId)) {
                        theoreticalBalances[transaction.toAccountId] += transaction.amount;
                    }
                }
            }
        });
        
        // Comparar saldos teóricos com saldos reais
        const discrepancies = [];
        accounts.forEach(account => {
            const theoretical = theoreticalBalances[account.id] || 0;
            const actual = account.balance || 0;
            const difference = Math.abs(theoretical - actual);
            
            if (difference > 0.01) { // Tolerância de 1 centavo
                discrepancies.push({
                    accountId: account.id,
                    accountName: account.name,
                    theoreticalBalance: theoretical,
                    actualBalance: actual,
                    difference: difference
                });
            }
        });
        
        const result = {
            totalAccounts: accounts.length,
            totalTransactions: transactions.length,
            discrepancies: discrepancies,
            hasIssues: discrepancies.length > 0,
            message: discrepancies.length === 0 ? 
                '✅ Integridade financeira verificada - Nenhum problema encontrado' :
                `⚠️ ${discrepancies.length} discrepâncias encontradas nos saldos`
        };
        
        console.log(`🔍 Resultado da verificação de integridade:`, result);
        return result;
        
    } catch (error) {
        console.error('Erro ao verificar integridade financeira:', error);
        throw error;
    }
};
