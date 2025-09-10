import { db, auth } from '../firebase-config.js';
import { 
    doc, 
    collection, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    getDocs, 
    getDoc, 
    onSnapshot, 
    query, 
    where, 
    orderBy, 
    limit,
    startAfter,
    runTransaction,
    serverTimestamp,
    setDoc
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

// Listener para mudanças de autenticação
export function onAuthStateChangedListener(callback) {
    return onAuthStateChanged(auth, callback);
}

// Autenticação
export async function signInUser(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return { success: true, user: userCredential.user };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function signUpUser(email, password) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // Criar documento inicial do usuário
        await addDoc(collection(db, 'users'), {
            uid: userCredential.user.uid,
            email: userCredential.user.email,
            createdAt: serverTimestamp(),
            totalBalance: 0,
            monthlyIncome: 0,
            monthlyExpenses: 0
        });
        
        return { success: true, user: userCredential.user };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function signOutUser() {
    try {
        await signOut(auth);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Listeners em tempo real com otimização para milhões de registros
export function onAccountsUpdate(callback) {
    const user = auth.currentUser;
    if (!user) return null;
    
    const q = query(
        collection(db, 'accounts'),
        where('userId', '==', user.uid)
        // Removido orderBy para evitar erro de índice
    );
    
    return onSnapshot(q, (snapshot) => {
        try {
            const accounts = [];
            snapshot.forEach((doc) => {
                accounts.push({ id: doc.id, ...doc.data() });
            });
            // Ordenar no cliente por data de criação (mais recente primeiro)
            accounts.sort((a, b) => {
                try {
                    const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
                    const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
                    return dateB - dateA;
                } catch (error) {
                    console.warn('Erro ao ordenar contas:', error);
                    return 0;
                }
            });
            callback(accounts);
        } catch (error) {
            console.error('Erro ao processar dados das contas:', error);
            callback([]);
        }
    }, (error) => {
        console.error('Erro no listener de contas:', error);
        // Tentar reconectar após 5 segundos
        setTimeout(() => {
            console.log('Tentando reconectar listener de contas...');
            onAccountsUpdate(callback);
        }, 5000);
    });
}

export function onTransactionsUpdate(callback) {
    const user = auth.currentUser;
    if (!user) return null;
    
    // Otimização: Carregar apenas as últimas 50 transações para o listener em tempo real
    // Isso evita sobrecarga quando há milhões de transações
    const q = query(
        collection(db, 'transactions'),
        where('userId', '==', user.uid),
        limit(50) // Limitar a apenas 50 transações mais recentes
    );
    
    return onSnapshot(q, (snapshot) => {
        try {
            const transactions = [];
            snapshot.forEach((doc) => {
                try {
                    const data = doc.data();
                    // Garantir que a data seja válida
                    if (data.date) {
                        transactions.push({ id: doc.id, ...data });
                    } else {
                        // Se não tem data, usar data atual
                        transactions.push({ 
                            id: doc.id, 
                            ...data, 
                            date: new Date() 
                        });
                    }
                } catch (error) {
                    console.warn('Erro ao processar transação:', error);
                }
            });
            
            // Ordenar no cliente para evitar problema de índice
            transactions.sort((a, b) => {
                try {
                    const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date);
                    const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date);
                    return dateB - dateA;
                } catch (error) {
                    console.warn('Erro ao ordenar transações:', error);
                    return 0;
                }
            });
            
            callback(transactions);
        } catch (error) {
            console.error('Erro ao processar dados das transações:', error);
            callback([]);
        }
    }, (error) => {
        console.error('Erro no listener de transações:', error);
        // Tentar reconectar após 5 segundos
        setTimeout(() => {
            console.log('Tentando reconectar listener de transações...');
            onTransactionsUpdate(callback);
        }, 5000);
    });
}

// Sistema de paginação otimizado para milhões de transações
export async function loadTransactionsWithPagination(page = 1, pageLimit = 20, filters = {}, lastDoc = null) {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error('Usuário não autenticado');

        let q = query(
            collection(db, 'transactions'),
            where('userId', '==', user.uid)
        );

        // Aplicar filtros se fornecidos
        if (filters.type) {
            q = query(q, where('type', '==', filters.type));
        }
        if (filters.accountId) {
            q = query(q, where('accountId', '==', filters.accountId));
        }
        if (filters.startDate) {
            q = query(q, where('date', '>=', filters.startDate));
        }
        if (filters.endDate) {
            q = query(q, where('date', '<=', filters.endDate));
        }

        // Usar cursor-based pagination para melhor performance
        if (lastDoc) {
            q = query(q, startAfter(lastDoc));
        }

        // Limitar resultados para evitar sobrecarga
        q = query(q, limit(pageLimit + 1)); // +1 para verificar se há mais dados

        const snapshot = await getDocs(q);
        const transactions = [];
        let hasMore = false;

        snapshot.forEach((doc, index) => {
            if (index < pageLimit) {
                transactions.push({ id: doc.id, ...doc.data() });
            } else {
                hasMore = true;
            }
        });

        // Ordenar no cliente por data (mais recente primeiro)
        transactions.sort((a, b) => {
            try {
                const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date);
                const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date);
                return dateB - dateA;
            } catch (error) {
                console.warn('Erro ao ordenar transações:', error);
                return 0;
            }
        });

        return {
            transactions,
            hasMore,
            total: transactions.length,
            page,
            limit: pageLimit,
            lastDoc: snapshot.docs[snapshot.docs.length - 1] || null
        };
    } catch (error) {
        console.error('Erro ao carregar transações com paginação:', error);
        throw error;
    }
}

// Função otimizada para buscar transações antigas usando cursor-based pagination
export async function loadOlderTransactions(lastDoc = null, pageLimit = 20) {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error('Usuário não autenticado');

        let q = query(
            collection(db, 'transactions'),
            where('userId', '==', user.uid)
        );

        // Usar cursor-based pagination para melhor performance
        if (lastDoc) {
            q = query(q, startAfter(lastDoc));
        }

        // Limitar resultados
        q = query(q, limit(pageLimit));

        const snapshot = await getDocs(q);
        const transactions = [];
        
        snapshot.forEach((doc) => {
            transactions.push({ id: doc.id, ...doc.data() });
        });

        // Ordenar no cliente por data (mais recente primeiro)
        transactions.sort((a, b) => {
            try {
                const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date);
                const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date);
                return dateB - dateA;
            } catch (error) {
                console.warn('Erro ao ordenar transações:', error);
                return 0;
            }
        });

        return {
            transactions,
            hasMore: snapshot.docs.length === pageLimit,
            lastDoc: snapshot.docs[snapshot.docs.length - 1] || null
        };
    } catch (error) {
        console.error('Erro ao carregar transações antigas:', error);
        throw error;
    }
}

export function onFixedBillsUpdate(callback) {
    const user = auth.currentUser;
    if (!user) return null;
    
    // Usar subcoleção conforme as regras de segurança
    const q = query(
        collection(db, 'users', user.uid, 'recurring_bills')
        // Removido orderBy para evitar erro de índice
    );
    
    return onSnapshot(q, (snapshot) => {
        try {
            const fixedBills = [];
            snapshot.forEach((doc) => {
                fixedBills.push({ id: doc.id, ...doc.data() });
            });
            // Ordenar no cliente por dia de vencimento
            fixedBills.sort((a, b) => (a.dueDay || 0) - (b.dueDay || 0));
            callback(fixedBills);
        } catch (error) {
            console.error('Erro ao processar dados das contas fixas:', error);
            callback([]);
        }
    }, (error) => {
        console.error('Erro no listener de contas fixas:', error);
        // Tentar reconectar após 5 segundos
        setTimeout(() => {
            console.log('Tentando reconectar listener de contas fixas...');
            onFixedBillsUpdate(callback);
        }, 5000);
    });
}

// Operações de conta
export async function addAccount(accountName, initialBalance) {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuário não autenticado');
    
    try {
        // Validar campos obrigatórios conforme as regras
        if (!accountName || accountName.trim() === '') {
            throw new Error('Nome da conta é obrigatório');
        }
        
        const balance = parseFloat(initialBalance) || 0;
        if (balance < 0) {
            throw new Error('Saldo inicial não pode ser negativo');
        }
        
        const accountData = {
            userId: user.uid,
            name: accountName.trim(),
            balance: balance,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };
        
        const docRef = await addDoc(collection(db, 'accounts'), accountData);
        return { success: true, accountId: docRef.id };
    } catch (error) {
        throw new Error(`Erro ao adicionar conta: ${error.message}`);
    }
}

export async function updateAccount(accountId, updateData) {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuário não autenticado');
    
    try {
        const accountRef = doc(db, 'accounts', accountId);
        const accountDoc = await getDoc(accountRef);
        
        if (!accountDoc.exists()) {
            throw new Error('Conta não encontrada');
        }
        
        const accountData = accountDoc.data();
        if (accountData.userId !== user.uid) {
            throw new Error('Acesso negado');
        }
        
        const updateFields = {
            updatedAt: serverTimestamp()
        };
        
        if (updateData.name !== undefined) {
            if (!updateData.name || updateData.name.trim() === '') {
                throw new Error('Nome da conta é obrigatório');
            }
            updateFields.name = updateData.name.trim();
        }
        
        if (updateData.balance !== undefined) {
            const balance = parseFloat(updateData.balance);
            if (isNaN(balance) || balance < 0) {
                throw new Error('Saldo deve ser um número válido maior ou igual a zero');
            }
            updateFields.balance = balance;
        }
        
        await updateDoc(accountRef, updateFields);
        return { success: true };
    } catch (error) {
        throw new Error(`Erro ao atualizar conta: ${error.message}`);
    }
}

export async function deleteAccount(accountId) {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuário não autenticado');
    
    try {
        const accountRef = doc(db, 'accounts', accountId);
        const accountDoc = await getDoc(accountRef);
        
        if (!accountDoc.exists()) {
            throw new Error('Conta não encontrada');
        }
        
        const accountData = accountDoc.data();
        if (accountData.userId !== user.uid) {
            throw new Error('Acesso negado');
        }
        
        // Verificar se há transações associadas
        const transactionsQuery = query(
            collection(db, 'transactions'),
            where('userId', '==', user.uid),
            where('accountId', '==', accountId)
        );
        
        const transactionsSnapshot = await getDocs(transactionsQuery);
        if (!transactionsSnapshot.empty) {
            throw new Error('Não é possível excluir uma conta que possui transações. Transfira ou exclua as transações primeiro.');
        }
        
        await deleteDoc(accountRef);
        return { success: true };
    } catch (error) {
        throw new Error(`Erro ao excluir conta: ${error.message}`);
    }
}

// Operações de transação (usando transações do Firestore)
export async function addTransaction(transactionData) {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuário não autenticado');
    
    // Validar campos obrigatórios conforme as regras
    const { accountId, amount, description, type, category, date } = transactionData;
    
    // Debug: verificar data recebida
    console.log('🔍 Debug - Data recebida no Firestore:', date);
    console.log('🔍 Debug - Tipo da data:', typeof date);
    if (date) {
        console.log('🔍 Debug - Data formatada:', new Date(date).toLocaleDateString('pt-BR'));
    }
    
    if (!description || description.trim() === '') {
        throw new Error('Descrição é obrigatória');
    }
    
    if (!amount || amount <= 0) {
        throw new Error('Valor deve ser maior que zero');
    }
    
    if (!type || !['income', 'expense', 'transfer', 'transfer_in', 'transfer_out'].includes(type)) {
        throw new Error('Tipo de transação inválido');
    }
    
    if (!accountId) {
        throw new Error('ID da conta é obrigatório');
    }
    
    return runTransaction(db, async (transaction) => {
        // Buscar a conta
        const accountRef = doc(db, 'accounts', accountId);
        const accountDoc = await transaction.get(accountRef);
        
        if (!accountDoc.exists()) {
            throw new Error('Conta não encontrada');
        }
        
        const accountData = accountDoc.data();
        const newBalance = accountData.balance + (type === 'expense' ? -amount : amount);
        
        // Validar saldo para despesas
        if (type === 'expense' && newBalance < 0) {
            throw new Error('Saldo insuficiente para realizar esta despesa');
        }
        
        // Atualizar saldo da conta
        transaction.update(accountRef, {
            balance: newBalance,
            updatedAt: serverTimestamp()
        });
        
        // Criar documento da transação com todos os campos obrigatórios
        const transactionRef = doc(collection(db, 'transactions'));
        transaction.set(transactionRef, {
            userId: user.uid,
            accountId,
            accountName: accountData.name,
            amount,
            description: description.trim(),
            type,
            category: category || 'outros',
            date: date ? (date instanceof Date ? date : new Date(date)) : serverTimestamp(),
            createdAt: serverTimestamp(),
            // Campos adicionais para pagamentos parciais de contas fixas
            isPartialPayment: transactionData.isPartialPayment || false,
            billId: transactionData.billId || null,
            remainingAmount: transactionData.remainingAmount || 0
        });
        
        return { success: true, transactionId: transactionRef.id };
    });
}

// Transferências (usando transações do Firestore)
export async function performTransfer(fromAccountId, toAccountId, amount) {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuário não autenticado');
    
    if (fromAccountId === toAccountId) {
        throw new Error('Não é possível transferir para a mesma conta');
    }
    
    return runTransaction(db, async (transaction) => {
        // Buscar contas de origem e destino
        const fromAccountRef = doc(db, 'accounts', fromAccountId);
        const toAccountRef = doc(db, 'accounts', toAccountId);
        
        const fromAccountDoc = await transaction.get(fromAccountRef);
        const toAccountDoc = await transaction.get(toAccountRef);
        
        if (!fromAccountDoc.exists() || !toAccountDoc.exists()) {
            throw new Error('Uma ou ambas as contas não foram encontradas');
        }
        
        const fromAccountData = fromAccountDoc.data();
        const toAccountData = toAccountDoc.data();
        
        // Validar saldo da conta de origem
        if (fromAccountData.balance < amount) {
            throw new Error('Saldo insuficiente na conta de origem');
        }
        
        // Atualizar saldos
        transaction.update(fromAccountRef, {
            balance: fromAccountData.balance - amount,
            updatedAt: serverTimestamp()
        });
        
        transaction.update(toAccountRef, {
            balance: toAccountData.balance + amount,
            updatedAt: serverTimestamp()
        });
        
        // Criar transações de saída e entrada
        const outTransactionRef = doc(collection(db, 'transactions'));
        const inTransactionRef = doc(collection(db, 'transactions'));
        
        transaction.set(outTransactionRef, {
            userId: user.uid,
            accountId: fromAccountId,
            accountName: fromAccountData.name,
            amount,
            description: `Transferência para ${toAccountData.name}`,
            type: 'transfer_out',
            category: 'transfer',
            date: serverTimestamp(),
            createdAt: serverTimestamp(),
            transferId: `${fromAccountId}_${toAccountId}_${Date.now()}`
        });
        
        transaction.set(inTransactionRef, {
            userId: user.uid,
            accountId: toAccountId,
            accountName: toAccountData.name,
            amount,
            description: `Transferência de ${fromAccountData.name}`,
            type: 'transfer_in',
            category: 'transfer',
            date: serverTimestamp(),
            createdAt: serverTimestamp(),
            transferId: `${fromAccountId}_${toAccountId}_${Date.now()}`
        });
        
        return { success: true };
    });
}

// Contas fixas
export async function addFixedBill(billData) {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuário não autenticado');
    
    try {
        const { name, amount, dueDay, category, startDate } = billData;
        
        // Validar campos obrigatórios conforme as regras
        if (!name || !amount || !dueDay) {
            throw new Error('Nome, valor e dia de vencimento são obrigatórios');
        }
        
        if (amount <= 0) {
            throw new Error('Valor deve ser maior que zero');
        }
        
        if (dueDay < 1 || dueDay > 31) {
            throw new Error('Dia de vencimento deve estar entre 1 e 31');
        }
        
        // Data inicial é obrigatória para controle correto de períodos
        const initialDate = startDate ? new Date(startDate) : new Date();
        
        // Validar se a data inicial é válida
        if (isNaN(initialDate.getTime())) {
            throw new Error('Data inicial inválida');
        }
        
        const fixedBillData = {
            description: name, // Campo obrigatório nas regras
            amount: parseFloat(amount),
            dueDay: parseInt(dueDay),
            userId: user.uid, // Campo obrigatório nas regras
            category: category || 'outros',
            initialDate: initialDate, // Data inicial obrigatória para controle de períodos
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            // Campos adicionais para controle de períodos
            firstPeriod: getPeriodFromDate(initialDate), // Primeiro período (YYYY-MM)
            isActive: true, // Conta ativa
            // Campos para auto-expansão
            totalPeriodsGenerated: 12, // Iniciar com 12 períodos
            autoExpansionEnabled: true, // Auto-expansão ativada por padrão
            lastExpansion: null // Data da última expansão
        };
        
        // Usar subcoleção conforme as regras de segurança
        const docRef = await addDoc(collection(db, 'users', user.uid, 'recurring_bills'), fixedBillData);
        return { success: true, billId: docRef.id };
    } catch (error) {
        throw new Error(`Erro ao adicionar conta fixa: ${error.message}`);
    }
}

export async function updateFixedBill(billId, updateData) {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuário não autenticado');
    
    try {
        const billRef = doc(db, 'users', user.uid, 'recurring_bills', billId);
        const billDoc = await getDoc(billRef);
        
        if (!billDoc.exists()) {
            throw new Error('Conta fixa não encontrada');
        }
        
        const updateFields = {
            updatedAt: serverTimestamp()
        };
        
        if (updateData.name !== undefined) {
            if (!updateData.name || updateData.name.trim() === '') {
                throw new Error('Nome da conta fixa é obrigatório');
            }
            updateFields.description = updateData.name.trim();
        }
        
        if (updateData.amount !== undefined) {
            const amount = parseFloat(updateData.amount);
            if (isNaN(amount) || amount <= 0) {
                throw new Error('Valor deve ser maior que zero');
            }
            updateFields.amount = amount;
        }
        
        if (updateData.dueDay !== undefined) {
            const dueDay = parseInt(updateData.dueDay);
            if (isNaN(dueDay) || dueDay < 1 || dueDay > 31) {
                throw new Error('Dia de vencimento deve estar entre 1 e 31');
            }
            updateFields.dueDay = dueDay;
        }
        
        if (updateData.category !== undefined) {
            updateFields.category = updateData.category;
        }
        
        if (updateData.startDate !== undefined) {
            const startDate = new Date(updateData.startDate);
            if (isNaN(startDate.getTime())) {
                throw new Error('Data inicial inválida');
            }
            updateFields.initialDate = startDate;
            updateFields.firstPeriod = getPeriodFromDate(startDate); // Atualizar primeiro período
        }
        
        await updateDoc(billRef, updateFields);
        return { success: true };
    } catch (error) {
        throw new Error(`Erro ao atualizar conta fixa: ${error.message}`);
    }
}

export async function deleteFixedBill(billId) {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuário não autenticado');
    
    try {
        const billRef = doc(db, 'users', user.uid, 'recurring_bills', billId);
        const billDoc = await getDoc(billRef);
        
        if (!billDoc.exists()) {
            throw new Error('Conta fixa não encontrada');
        }
        
        await deleteDoc(billRef);
        return { success: true };
    } catch (error) {
        throw new Error(`Erro ao excluir conta fixa: ${error.message}`);
    }
}

// Função para deletar todas as transações do usuário
export async function deleteAllTransactions() {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuário não autenticado');
    
    try {
        // Buscar todas as transações do usuário
        const transactionsQuery = query(
            collection(db, 'transactions'),
            where('userId', '==', user.uid)
        );
        
        const transactionsSnapshot = await getDocs(transactionsQuery);
        
        if (transactionsSnapshot.empty) {
            return { success: true, message: 'Nenhuma transação encontrada para deletar' };
        }
        
        // Deletar todas as transações
        const deletePromises = transactionsSnapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);
        
        // Resetar saldos das contas para zero
        const accountsQuery = query(
            collection(db, 'accounts'),
            where('userId', '==', user.uid)
        );
        
        const accountsSnapshot = await getDocs(accountsQuery);
        const updatePromises = accountsSnapshot.docs.map(doc => 
            updateDoc(doc.ref, { 
                balance: 0, 
                updatedAt: serverTimestamp() 
            })
        );
        
        await Promise.all(updatePromises);
        
        return { 
            success: true, 
            message: `${transactionsSnapshot.size} transações deletadas com sucesso`,
            deletedCount: transactionsSnapshot.size
        };
    } catch (error) {
        throw new Error(`Erro ao deletar transações: ${error.message}`);
    }
}

// Função para adicionar uma dívida
export async function addDebt(debtData) {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuário não autenticado');
    
    // Validar campos obrigatórios
    const { amount, debtorName, description, type, category, date } = debtData;
    
    if (!amount || amount <= 0) {
        throw new Error('Valor deve ser maior que zero');
    }
    
    if (!debtorName || debtorName.trim() === '') {
        throw new Error('Nome do devedor é obrigatório');
    }
    
    if (!description || description.trim() === '') {
        throw new Error('Descrição é obrigatória');
    }
    
    try {
        const debtRef = doc(collection(db, 'debts'));
        await setDoc(debtRef, {
            userId: user.uid,
            amount,
            debtorName: debtorName.trim(),
            description: description.trim(),
            type: type || 'debt',
            category: category || 'dividas_emprestimos',
            date: date || serverTimestamp(),
            isActive: true,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        
        return { success: true, debtId: debtRef.id };
    } catch (error) {
        throw new Error(`Erro ao adicionar dívida: ${error.message}`);
    }
}

// Função para consultar dívidas
export async function queryDebts(queryData) {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuário não autenticado');
    
    try {
        const debtsQuery = query(
            collection(db, 'debts'),
            where('userId', '==', user.uid),
            where('isActive', '==', true)
        );
        
        const debtsSnapshot = await getDocs(debtsQuery);
        
        if (debtsSnapshot.empty) {
            return '💳 **Suas dívidas:**\n\nNenhuma dívida pendente encontrada. 🎉\n\n**Para registrar uma dívida, diga:**\n• "Estou devendo a Maria 100 reais"\n• "Devo 50 reais para a farmácia"\n• "Peguei emprestado 200 reais do João"';
        }
        
        const debts = debtsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        const totalDebt = debts.reduce((sum, debt) => sum + (debt.amount || 0), 0);
        
        const debtsList = debts.map(debt => 
            `• **${debt.debtorName}:** R$ ${(debt.amount || 0).toFixed(2)} - ${debt.description}`
        ).join('\n');
        
        return `💳 **Suas dívidas pendentes:**\n\n${debtsList}\n\n` +
               `💰 **Total em dívidas:** R$ ${totalDebt.toFixed(2)}\n\n` +
               `**Para marcar uma dívida como paga, diga:**\n` +
               `• "Paguei a dívida com Maria"\n` +
               `• "Quitei a dívida da farmácia"\n` +
               `• "Devolvi o dinheiro para João"`;
    } catch (error) {
        throw new Error(`Erro ao consultar dívidas: ${error.message}`);
    }
}

// Função para estornar uma transação
export async function refundTransaction(transactionId) {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuário não autenticado');
    
    try {
        // Buscar a transação
        const transactionRef = doc(db, 'transactions', transactionId);
        const transactionDoc = await getDoc(transactionRef);
        
        if (!transactionDoc.exists()) {
            throw new Error('Transação não encontrada');
        }
        
        const transactionData = transactionDoc.data();
        
        // Verificar se a transação pertence ao usuário
        if (transactionData.userId !== user.uid) {
            throw new Error('Transação não pertence ao usuário');
        }
        
        // Buscar a conta associada
        const accountRef = doc(db, 'accounts', transactionData.accountId);
        const accountDoc = await getDoc(accountRef);
        
        if (!accountDoc.exists()) {
            throw new Error('Conta não encontrada');
        }
        
        const accountData = accountDoc.data();
        
        // Executar estorno como uma transação atômica
        await runTransaction(db, async (transaction) => {
            // CORREÇÃO: Reverter o saldo da conta corretamente
            // Se era uma despesa, devemos somar o valor de volta
            // Se era uma receita, devemos subtrair o valor
            let newBalance;
            if (transactionData.type === 'expense') {
                // Era despesa, então devemos somar o valor de volta
                newBalance = accountData.balance + transactionData.amount;
            } else if (transactionData.type === 'income') {
                // Era receita, então devemos subtrair o valor
                newBalance = accountData.balance - transactionData.amount;
            } else {
                // Para transferências, não alteramos o saldo aqui
                // pois cada transferência tem duas transações (entrada e saída)
                newBalance = accountData.balance;
            }
            
            // Atualizar saldo da conta
            transaction.update(accountRef, { 
                balance: newBalance,
                updatedAt: serverTimestamp()
            });
            
            // Deletar a transação original
            transaction.delete(transactionRef);
        });
        
        return { 
            success: true, 
            message: `Estorno de R$ ${transactionData.amount.toFixed(2)} realizado com sucesso`,
            refundedAmount: transactionData.amount,
            newBalance: accountData.balance + (transactionData.type === 'expense' ? transactionData.amount : -transactionData.amount)
        };
    } catch (error) {
        throw new Error(`Erro ao estornar transação: ${error.message}`);
    }
}

// ========================================
// 💳 FUNÇÕES AUXILIARES PARA CONTAS FIXAS
// ========================================

// Função para obter período (YYYY-MM) de uma data
function getPeriodFromDate(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${year}-${month}`;
}

// Função para obter próximo período baseado na data inicial
function getNextPeriodFromInitial(initialDate, dueDay, targetPeriod = null) {
    if (targetPeriod) {
        return targetPeriod;
    }
    
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    
    // Calcular próximo período baseado na data inicial
    const initialYear = initialDate.getFullYear();
    const initialMonth = initialDate.getMonth() + 1;
    
    // Se estamos no mesmo ano e mês da data inicial, usar próximo mês
    if (currentYear === initialYear && currentMonth === initialMonth) {
        const nextMonth = currentMonth + 1;
        const nextYear = nextMonth > 12 ? currentYear + 1 : currentYear;
        const adjustedMonth = nextMonth > 12 ? 1 : nextMonth;
        return `${nextYear}-${adjustedMonth.toString().padStart(2, '0')}`;
    }
    
    // Caso contrário, calcular baseado no dia de vencimento
    if (today.getDate() > dueDay) {
        // Se já passou do dia de vencimento, próximo período é próximo mês
        const nextMonth = currentMonth + 1;
        const nextYear = nextMonth > 12 ? currentYear + 1 : currentYear;
        const adjustedMonth = nextMonth > 12 ? 1 : nextMonth;
        return `${nextYear}-${adjustedMonth.toString().padStart(2, '0')}`;
    } else {
        // Se ainda não passou do dia de vencimento, período atual
        return `${currentYear}-${currentMonth.toString().padStart(2, '0')}`;
    }
}

// Função para calcular todos os períodos desde a data inicial com auto-expansão CORRIGIDA
function calculateAllPeriodsFromInitial(initialDate, dueDay, monthsCount = 12, autoExpand = true) {
    const periods = [];
    const startYear = initialDate.getFullYear();
    const startMonth = initialDate.getMonth() + 1;
    
    // CORREÇÃO: Se auto-expansão estiver ativa, usar o total de períodos gerados
    // Se não, usar apenas o número especificado
    const maxMonths = autoExpand ? monthsCount : monthsCount;
    
    for (let i = 0; i < maxMonths; i++) {
        const targetMonth = startMonth + i;
        const targetYear = targetMonth > 12 ? startYear + Math.floor((targetMonth - 1) / 12) : startYear;
        const adjustedMonth = targetMonth > 12 ? ((targetMonth - 1) % 12) + 1 : targetMonth;
        
        const period = `${targetYear}-${adjustedMonth.toString().padStart(2, '0')}`;
        periods.push({
            period,
            year: targetYear,
            month: adjustedMonth,
            monthName: new Date(targetYear, adjustedMonth - 1).toLocaleDateString('pt-BR', { month: 'long' }),
            dueDate: new Date(targetYear, adjustedMonth - 1, dueDay),
            isAutoGenerated: i >= 12 // Marcar períodos auto-gerados apenas após os primeiros 12
        });
    }
    
    return periods;
}

// Função para verificar se precisa expandir períodos automaticamente
export async function checkAndExpandPeriods(billId) {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuário não autenticado');
    
    try {
        // Buscar dados da conta fixa
        const billRef = doc(db, 'users', user.uid, 'recurring_bills', billId);
        const billDoc = await getDoc(billRef);
        
        if (!billDoc.exists()) {
            throw new Error('Conta fixa não encontrada');
        }
        
        const billData = billDoc.data();
        
        // Verificar se a auto-expansão está habilitada
        if (!billData.autoExpansionEnabled) {
            return {
                expanded: false,
                periodsRemaining: 0,
                message: 'Auto-expansão desabilitada para esta conta.'
            };
        }
        
        const initialDate = billData.initialDate?.toDate ? billData.initialDate.toDate() : new Date(billData.initialDate);
        
        // Calcular períodos atuais usando o total de períodos gerados
        const totalPeriods = billData.totalPeriodsGenerated || 12;
        const currentPeriods = calculateAllPeriodsFromInitial(initialDate, billData.dueDay, totalPeriods, false);
        
        // CORREÇÃO: Encontrar o último período pago em vez de usar período atual
        let lastPaidIndex = -1;
        for (let i = currentPeriods.length - 1; i >= 0; i--) {
            const period = currentPeriods[i];
            const periodStatus = await getMonthPaymentStatus(billId, period.year, period.month);
            if (periodStatus.isFullyPaid) {
                lastPaidIndex = i;
                break;
            }
        }
        
        // Calcular períodos restantes baseado no último período pago
        const periodsRemaining = currentPeriods.length - (lastPaidIndex + 1);
        
        // CORREÇÃO: Expansão acontece quando restam 5 ou menos períodos
        if (periodsRemaining <= 5) {
            // Atualizar a conta fixa para indicar que foi expandida
            await updateDoc(billRef, {
                lastExpansion: serverTimestamp(),
                totalPeriodsGenerated: (billData.totalPeriodsGenerated || 12) + 12,
                autoExpansionEnabled: true
            });
            
            return {
                expanded: true,
                periodsRemaining,
                newTotalPeriods: (billData.totalPeriodsGenerated || 12) + 12,
                message: `Períodos expandidos automaticamente! Agora você tem ${(billData.totalPeriodsGenerated || 12) + 12} períodos disponíveis.`
            };
        }
        
        return {
            expanded: false,
            periodsRemaining,
            message: `Ainda restam ${periodsRemaining} períodos.`
        };
        
    } catch (error) {
        throw new Error(`Erro ao verificar expansão de períodos: ${error.message}`);
    }
}

// ========================================
// 💳 FUNÇÕES PARA CONTAS FIXAS MELHORADAS
// ========================================

// Função para pagar uma conta fixa (completa ou parcial) com controle de períodos mensais
export async function payFixedBill(billId, paymentAmount, accountId, isFullPayment = false, targetPeriod = null, isRemainingPayment = false) {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuário não autenticado');
    
    try {
        // Buscar a conta fixa
        const billRef = doc(db, 'users', user.uid, 'recurring_bills', billId);
        const billDoc = await getDoc(billRef);
        
        if (!billDoc.exists()) {
            throw new Error('Conta fixa não encontrada');
        }
        
        const billData = billDoc.data();
        
        // Buscar a conta de pagamento
        const accountRef = doc(db, 'accounts', accountId);
        const accountDoc = await getDoc(accountRef);
        
        if (!accountDoc.exists()) {
            throw new Error('Conta de pagamento não encontrada');
        }
        
        const accountData = accountDoc.data();
        
        // Verificar se a conta pertence ao usuário
        if (accountData.userId !== user.uid) {
            throw new Error('Conta não pertence ao usuário');
        }
        
        // Determinar período do pagamento
        let paymentPeriod = targetPeriod;
        if (!paymentPeriod) {
            // CORREÇÃO: Se não especificado, detectar automaticamente o período correto
            const paymentsByPeriod = await getBillPaymentsOptimized(billId, 100);
            const today = new Date();
            const currentYear = today.getFullYear();
            const currentMonth = today.getMonth() + 1;
            const currentPeriod = `${currentYear}-${currentMonth.toString().padStart(2, '0')}`;
            
            // Verificar se período atual tem valor restante
            const currentPeriodPaid = paymentsByPeriod[currentPeriod] || 0;
            const currentPeriodRemaining = billData.amount - currentPeriodPaid;
            
            if (currentPeriodRemaining > 0) {
                // Período atual tem valor restante - usar período atual
                paymentPeriod = currentPeriod;
            } else {
                // Período atual está pago - buscar próximo período com pagamento parcial
                const sortedPeriods = Object.keys(paymentsByPeriod).sort();
                for (const period of sortedPeriods) {
                    if (period > currentPeriod) {
                        const periodPaid = paymentsByPeriod[period] || 0;
                        const periodRemaining = billData.amount - periodPaid;
                        if (periodRemaining > 0 && periodPaid > 0) {
                            // Encontrou período futuro com pagamento parcial - usar este período
                            paymentPeriod = period;
                            break;
                        }
                    }
                }
                
                // Se não encontrou período futuro com pagamento parcial, usar período atual
                if (!paymentPeriod) {
                    paymentPeriod = currentPeriod;
                }
            }
        }
        
        // Calcular valores pagos anteriormente para este período específico
        const previousPaymentsQuery = query(
            collection(db, 'transactions'),
            where('userId', '==', user.uid),
            where('billId', '==', billId),
            where('type', '==', 'expense'),
            where('isBillPayment', '==', true),
            where('paymentPeriod', '==', paymentPeriod)
        );
        
        const previousPaymentsSnapshot = await getDocs(previousPaymentsQuery);
        const totalPaidThisPeriod = previousPaymentsSnapshot.docs.reduce((sum, doc) => {
            const data = doc.data();
            return sum + (data.amount || 0);
        }, 0);
        
        const remainingAmount = billData.amount - totalPaidThisPeriod;
        
        // 🧠 SISTEMA INTELIGENTE: Ajustar valor para pagamento restante
        if (isRemainingPayment) {
            paymentAmount = remainingAmount; // Usar valor restante real
            isFullPayment = true; // Pagamento restante é sempre completo
        }
        
        // Validações
        if (remainingAmount <= 0) {
            throw new Error(`Esta conta já foi paga completamente para o período ${paymentPeriod}`);
        }
        
        if (paymentAmount > remainingAmount) {
            throw new Error(`Valor do pagamento (R$ ${paymentAmount.toFixed(2)}) é maior que o valor restante (R$ ${remainingAmount.toFixed(2)}) para o período ${paymentPeriod}`);
        }
        
        if (accountData.balance < paymentAmount) {
            throw new Error(`Saldo insuficiente na conta ${accountData.name}. Saldo: R$ ${accountData.balance.toFixed(2)}`);
        }
        
        // Executar pagamento como transação atômica
        return runTransaction(db, async (transaction) => {
            // Atualizar saldo da conta
            const newBalance = accountData.balance - paymentAmount;
            transaction.update(accountRef, {
                balance: newBalance,
                updatedAt: serverTimestamp()
            });
            
            // Criar transação de pagamento
            const paymentTransactionRef = doc(collection(db, 'transactions'));
            transaction.set(paymentTransactionRef, {
                userId: user.uid,
                accountId: accountId,
                accountName: accountData.name,
                amount: paymentAmount,
                description: `${isRemainingPayment ? 'Pagamento restante' : (isFullPayment ? 'Pagamento completo' : 'Pagamento parcial')} da conta fixa: ${billData.description} (${paymentPeriod})`,
                type: 'expense',
                category: billData.category || 'outros',
                date: serverTimestamp(),
                createdAt: serverTimestamp(),
                isBillPayment: true, // Marca como pagamento de conta fixa
                billId: billId,
                billDescription: billData.description,
                remainingAmount: remainingAmount - paymentAmount,
                paymentType: isFullPayment ? 'full' : 'partial',
                paymentPeriod: paymentPeriod, // Novo campo para controle de período
                dueDay: billData.dueDay // Para facilitar consultas futuras
            });
            
            return { 
                success: true, 
                paymentId: paymentTransactionRef.id,
                remainingAmount: remainingAmount - paymentAmount,
                isFullyPaid: (remainingAmount - paymentAmount) <= 0,
                paymentPeriod: paymentPeriod
            };
        });
        
    } catch (error) {
        throw new Error(`Erro ao pagar conta fixa: ${error.message}`);
    }
}

// Função otimizada para buscar pagamentos de uma conta fixa (processamento no servidor)
async function getBillPaymentsOptimized(billId, limitCount = 50) {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuário não autenticado');
    
    const paymentsQuery = query(
        collection(db, 'transactions'),
        where('userId', '==', user.uid),
        where('billId', '==', billId),
        where('type', '==', 'expense'),
        where('isBillPayment', '==', true),
        limit(limitCount)
    );
    
    const snapshot = await getDocs(paymentsQuery);
    const paymentsByPeriod = {};
    
    // Processamento no servidor (Firestore)
    snapshot.docs.forEach(doc => {
        const data = doc.data();
        const period = data.paymentPeriod;
        const amount = data.amount || 0;
        
        if (period) {
            if (!paymentsByPeriod[period]) {
                paymentsByPeriod[period] = 0;
            }
            paymentsByPeriod[period] += amount;
        }
    });
    
    return paymentsByPeriod;
}

// Função para calcular último período pago no servidor (otimizada)
async function calculateLastPaidPeriodOnServer(billId, billAmount) {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuário não autenticado');
    
    try {
        // Buscar todos os pagamentos desta conta fixa de uma vez
        const paymentsQuery = query(
            collection(db, 'transactions'),
            where('userId', '==', user.uid),
            where('billId', '==', billId),
            where('type', '==', 'expense'),
            where('isBillPayment', '==', true),
            limit(100) // Limite maior para garantir que pegue todos os períodos
        );
        
        const paymentsSnapshot = await getDocs(paymentsQuery);
        const paymentsByPeriod = {};
        
        // Processar no servidor
        paymentsSnapshot.docs.forEach(doc => {
            const data = doc.data();
            const period = data.paymentPeriod;
            const amount = data.amount || 0;
            
            if (period) {
                if (!paymentsByPeriod[period]) {
                    paymentsByPeriod[period] = 0;
                }
                paymentsByPeriod[period] += amount;
            }
        });
        
        // Encontrar último período pago completamente (processamento no servidor)
        const sortedPeriods = Object.keys(paymentsByPeriod).sort().reverse();
        
        for (const period of sortedPeriods) {
            const totalPaidInPeriod = paymentsByPeriod[period];
            
            if (totalPaidInPeriod >= billAmount) {
                // Este período foi pago completamente
                const [year, month] = period.split('-');
                const monthNumber = parseInt(month);
                const yearNumber = parseInt(year);
                
                return {
                    period: period,
                    year: yearNumber,
                    month: monthNumber,
                    monthName: new Date(yearNumber, monthNumber - 1).toLocaleDateString('pt-BR', { month: 'long' }),
                    amount: billAmount
                };
            }
        }
        
        return null; // Nenhum período pago completamente
        
    } catch (error) {
        console.error('Erro ao calcular último período pago:', error);
        return null;
    }
}

// Função para calcular status real de uma conta fixa com controle de períodos mensais OTIMIZADA
export async function getFixedBillStatus(billId) {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuário não autenticado');
    
    try {
        // Buscar a conta fixa
        const billRef = doc(db, 'users', user.uid, 'recurring_bills', billId);
        const billDoc = await getDoc(billRef);
        
        if (!billDoc.exists()) {
            throw new Error('Conta fixa não encontrada');
        }
        
        const billData = billDoc.data();
        
        // Usar data inicial para calcular períodos corretamente
        const initialDate = billData.initialDate?.toDate ? billData.initialDate.toDate() : new Date(billData.initialDate);
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth() + 1;
        const currentDay = today.getDate();
        
        // 🧠 CORREÇÃO: Calcular período atual baseado na data inicial da conta
        // Se a conta foi criada em período anterior, considerar o período de criação como "atual"
        const initialPeriod = getPeriodFromDate(initialDate);
        const todayPeriod = getPeriodFromDate(today);
        
        // Determinar qual período deve ser considerado como "atual" para esta conta
        let currentPeriod;
        if (initialPeriod >= todayPeriod) {
            // Conta criada no futuro ou hoje - usar período de hoje
            currentPeriod = todayPeriod;
        } else {
            // Conta criada no passado - usar período de hoje (não o período inicial)
            currentPeriod = todayPeriod;
        }
        
        // OTIMIZAÇÃO: Processamento no servidor - buscar pagamentos e calcular último período pago
        const paymentsByPeriod = await getBillPaymentsOptimized(billId, 100);
        const totalPaidThisPeriod = paymentsByPeriod[currentPeriod] || 0;
        
        // CORREÇÃO: Verificar se há pagamentos parciais em períodos futuros que devem ser considerados
        let effectiveRemainingAmount = billData.amount - totalPaidThisPeriod;
        let hasPartialPaymentInCurrentPeriod = totalPaidThisPeriod > 0 && totalPaidThisPeriod < billData.amount;
        
        // Se período atual está pago completamente, verificar se há pagamentos parciais em períodos futuros
        if (totalPaidThisPeriod >= billData.amount) {
            // Buscar próximo período com pagamento parcial
            const sortedPeriods = Object.keys(paymentsByPeriod).sort();
            for (const period of sortedPeriods) {
                if (period > currentPeriod) {
                    const periodPaid = paymentsByPeriod[period] || 0;
                    if (periodPaid > 0 && periodPaid < billData.amount) {
                        // Há pagamento parcial em período futuro - considerar como "parcial" do período atual
                        effectiveRemainingAmount = billData.amount - periodPaid;
                        hasPartialPaymentInCurrentPeriod = true;
                        break;
                    }
                }
            }
        }
        
        // Calcular último período pago no servidor (otimizado)
        const lastPaidPeriod = await calculateLastPaidPeriodOnServer(billId, billData.amount);
        
        const remainingAmount = effectiveRemainingAmount;
        
        // Calcular data de vencimento para o período atual
        const dueDate = new Date(currentYear, currentMonth - 1, billData.dueDay);
        
        // Verificar se a conta está realmente vencida
        // Uma conta só está vencida se:
        // 1. Já passou do dia de vencimento DESTE MÊS
        // 2. E não foi paga completamente
        // 3. E já passou da data inicial da conta
        const isOverdue = (currentDay > billData.dueDay) && 
                         (remainingAmount > 0) && 
                         (today >= initialDate);
        
        // Calcular dias até o vencimento (negativo se já passou)
        const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
        
        // Determinar status baseado no período atual
        let status = 'pending';
        let statusText = 'Pendente';
        let statusClass = 'text-blue-400';
        let canPay = true; // Botão sempre aparece quando há valor restante
        
        if (remainingAmount <= 0) {
            status = 'paid';
            statusText = 'Paga';
            statusClass = 'text-green-400';
            canPay = true; // Pode pagar próximo período
        } else if (hasPartialPaymentInCurrentPeriod) {
            status = 'partial';
            statusText = 'Paga Parcial';
            statusClass = 'text-yellow-400';
            canPay = true;
        } else if (isOverdue) {
            status = 'overdue';
            statusText = 'Vencida';
            statusClass = 'text-red-400';
            canPay = true;
        } else if (daysUntilDue === 0) {
            status = 'due-today';
            statusText = 'Vence Hoje';
            statusClass = 'text-orange-500';
            canPay = true;
        } else if (daysUntilDue <= 7 && daysUntilDue > 0) {
            // 🧠 CORREÇÃO: Se não há pagamentos ainda, não é "quase vencendo", é "pendente"
            if (totalPaidThisPeriod === 0 && !hasPartialPaymentInCurrentPeriod) {
                status = 'pending';
                statusText = 'Pendente';
                statusClass = 'text-blue-400';
            } else {
                status = 'due-soon';
                statusText = 'Quase Vencendo';
                statusClass = 'text-orange-400';
            }
            canPay = true;
        }
        
        return {
            status,
            statusText,
            statusClass,
            totalAmount: billData.amount,
            totalPaid: totalPaidThisPeriod,
            remainingAmount,
            daysUntilDue,
            dueDate: dueDate.toISOString(),
            isOverdue,
            isDueSoon: daysUntilDue <= 7 && daysUntilDue >= 0,
            isFullyPaid: remainingAmount <= 0,
            hasPartialPayment: totalPaidThisPeriod > 0,
            canPay, // Sempre true quando há valor restante
            currentPeriod,
            // Informações adicionais para controle
            nextPeriodDue: getNextPeriodDueDate(billData.dueDay),
            canPayNextPeriod: await canPayNextPeriod(billId),
            // Informações da conta fixa
            billDescription: billData.description,
            dueDay: billData.dueDay,
            initialDate: initialDate,
            firstPeriod: billData.firstPeriod,
            // Último período pago completamente
            lastPaidPeriod: lastPaidPeriod
        };
        
    } catch (error) {
        throw new Error(`Erro ao calcular status da conta fixa: ${error.message}`);
    }
}

// Função auxiliar para calcular próxima data de vencimento
function getNextPeriodDueDate(dueDay) {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    
    // Próximo mês
    const nextMonth = currentMonth + 1;
    const nextYear = nextMonth > 11 ? currentYear + 1 : currentYear;
    const adjustedNextMonth = nextMonth > 11 ? 0 : nextMonth;
    
    return new Date(nextYear, adjustedNextMonth, dueDay);
}

// Função auxiliar para verificar se pode pagar próximo período
export async function canPayNextPeriod(billId) {
    const user = auth.currentUser;
    if (!user) return false;
    
    try {
        // Calcular próximo período
        const today = new Date();
        const nextMonth = today.getMonth() + 1;
        const nextYear = nextMonth > 11 ? today.getFullYear() + 1 : today.getFullYear();
        const adjustedNextMonth = nextMonth > 11 ? 1 : nextMonth + 1;
        const nextPeriod = `${nextYear}-${adjustedNextMonth.toString().padStart(2, '0')}`;
        
        // Verificar se já tem pagamento para o próximo período
        const nextPeriodQuery = query(
            collection(db, 'transactions'),
            where('userId', '==', user.uid),
            where('billId', '==', billId),
            where('type', '==', 'expense'),
            where('isBillPayment', '==', true),
            where('paymentPeriod', '==', nextPeriod)
        );
        
        const nextPeriodSnapshot = await getDocs(nextPeriodQuery);
        const nextPeriodPaid = nextPeriodSnapshot.docs.reduce((sum, doc) => {
            const data = doc.data();
            return sum + (data.amount || 0);
        }, 0);
        
        // Buscar dados da conta fixa para verificar valor total
        const billRef = doc(db, 'users', user.uid, 'recurring_bills', billId);
        const billDoc = await getDoc(billRef);
        
        if (!billDoc.exists()) return false;
        
        const billData = billDoc.data();
        
        // Pode pagar próximo período se não foi pago completamente
        return nextPeriodPaid < billData.amount;
        
    } catch (error) {
        console.error('Erro ao verificar próximo período:', error);
        return false;
    }
}

// Função para obter todas as contas fixas com status atualizado
export async function getFixedBillsWithStatus() {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuário não autenticado');
    
    try {
        // Buscar todas as contas fixas
        const billsQuery = query(
            collection(db, 'users', user.uid, 'recurring_bills')
            // Removido orderBy para evitar erro de índice
        );
        
        const billsSnapshot = await getDocs(billsQuery);
        const bills = [];
        
        // Para cada conta fixa, calcular o status
        for (const billDoc of billsSnapshot.docs) {
            const billData = billDoc.data();
            const status = await getFixedBillStatus(billDoc.id);
            
            bills.push({
                id: billDoc.id,
                ...billData,
                ...status
            });
        }
        
        // Ordenar no cliente por dia de vencimento
        bills.sort((a, b) => (a.dueDay || 0) - (b.dueDay || 0));
        
        return bills;
        
    } catch (error) {
        throw new Error(`Erro ao buscar contas fixas: ${error.message}`);
    }
}

// Função para marcar uma conta fixa como paga (sem transação)
export async function markFixedBillAsPaid(billId, paymentDate = null) {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuário não autenticado');
    
    try {
        // Buscar a conta fixa
        const billRef = doc(db, 'users', user.uid, 'recurring_bills', billId);
        const billDoc = await getDoc(billRef);
        
        if (!billDoc.exists()) {
            throw new Error('Conta fixa não encontrada');
        }
        
        const billData = billDoc.data();
        
        // Atualizar com data de pagamento
        await updateDoc(billRef, {
            lastPaidDate: paymentDate || serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        
        return { success: true };
        
    } catch (error) {
        throw new Error(`Erro ao marcar conta como paga: ${error.message}`);
    }
}

// Função para pagar conta fixa antecipadamente (próximo período)
export async function payFixedBillAdvance(billId, paymentAmount, accountId, targetPeriod = null) {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuário não autenticado');
    
    try {
        // Se não especificado, calcular próximo período
        if (!targetPeriod) {
            const today = new Date();
            const nextMonth = today.getMonth() + 1;
            const nextYear = nextMonth > 11 ? today.getFullYear() + 1 : today.getFullYear();
            const adjustedNextMonth = nextMonth > 11 ? 1 : nextMonth + 1;
            targetPeriod = `${nextYear}-${adjustedNextMonth.toString().padStart(2, '0')}`;
        }
        
        // Usar a função de pagamento normal com período específico
        return await payFixedBill(billId, paymentAmount, accountId, false, targetPeriod);
        
    } catch (error) {
        throw new Error(`Erro ao pagar conta antecipadamente: ${error.message}`);
    }
}

// Função otimizada para obter histórico de pagamentos (versão rápida)
export async function getFixedBillPaymentHistoryOptimized(billId, limitPeriods = 12) {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuário não autenticado');
    
    try {
        // Buscar todos os pagamentos desta conta fixa de uma vez
        const paymentsQuery = query(
            collection(db, 'transactions'),
            where('userId', '==', user.uid),
            where('billId', '==', billId),
            where('type', '==', 'expense'),
            where('isBillPayment', '==', true),
            limit(100) // Limitar para evitar sobrecarga
        );
        
        const paymentsSnapshot = await getDocs(paymentsQuery);
        const payments = [];
        
        paymentsSnapshot.forEach((doc) => {
            const data = doc.data();
            payments.push({
                id: doc.id,
                ...data
            });
        });
        
        // Agrupar por período no cliente (muito mais rápido)
        const paymentsByPeriod = {};
        payments.forEach(payment => {
            const period = payment.paymentPeriod || 'sem-período';
            if (!paymentsByPeriod[period]) {
                // Calcular nome do mês a partir do período
                let monthName = 'Período Desconhecido';
                let year = '2025';
                
                if (period !== 'sem-período' && period.includes('-')) {
                    const [periodYear, periodMonth] = period.split('-');
                    year = periodYear;
                    const monthNumber = parseInt(periodMonth);
                    if (monthNumber >= 1 && monthNumber <= 12) {
                        monthName = new Date(parseInt(periodYear), monthNumber - 1).toLocaleDateString('pt-BR', { month: 'long' });
                    }
                }
                
                paymentsByPeriod[period] = {
                    period,
                    monthName,
                    year,
                    totalPaid: 0,
                    payments: [],
                    paymentCount: 0
                };
            }
            paymentsByPeriod[period].totalPaid += payment.amount || 0;
            paymentsByPeriod[period].payments.push(payment);
            paymentsByPeriod[period].paymentCount += 1;
        });
        
        // Converter para array e ordenar por período (mais recente primeiro)
        const history = Object.values(paymentsByPeriod).sort((a, b) => {
            return b.period.localeCompare(a.period);
        }).slice(0, limitPeriods);
        
        return history;
        
    } catch (error) {
        throw new Error(`Erro ao obter histórico de pagamentos: ${error.message}`);
    }
}

// Função para obter períodos disponíveis para pagamento antecipado
export async function getAvailablePaymentPeriods(billId) {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuário não autenticado');
    
    try {
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth() + 1;
        
        const availablePeriods = [];
        
        // Gerar próximos 6 meses
        for (let i = 0; i < 6; i++) {
            const targetMonth = currentMonth + i;
            const targetYear = targetMonth > 12 ? currentYear + 1 : currentYear;
            const adjustedMonth = targetMonth > 12 ? targetMonth - 12 : targetMonth;
            
            const period = `${targetYear}-${adjustedMonth.toString().padStart(2, '0')}`;
            
            // Verificar se já foi pago completamente
            const periodQuery = query(
                collection(db, 'transactions'),
                where('userId', '==', user.uid),
                where('billId', '==', billId),
                where('type', '==', 'expense'),
                where('isBillPayment', '==', true),
                where('paymentPeriod', '==', period)
            );
            
            const periodSnapshot = await getDocs(periodQuery);
            const totalPaid = periodSnapshot.docs.reduce((sum, doc) => {
                const data = doc.data();
                return sum + (data.amount || 0);
            }, 0);
            
            // Buscar dados da conta fixa
            const billRef = doc(db, 'users', user.uid, 'recurring_bills', billId);
            const billDoc = await getDoc(billRef);
            
            if (billDoc.exists()) {
                const billData = billDoc.data();
                const remainingAmount = billData.amount - totalPaid;
                
                availablePeriods.push({
                    period,
                    year: targetYear,
                    month: adjustedMonth,
                    monthName: new Date(targetYear, adjustedMonth - 1).toLocaleDateString('pt-BR', { month: 'long' }),
                    totalAmount: billData.amount,
                    totalPaid,
                    remainingAmount,
                    canPay: remainingAmount > 0,
                    isCurrentPeriod: i === 0
                });
            }
        }
        
        return availablePeriods;
        
    } catch (error) {
        throw new Error(`Erro ao obter períodos disponíveis: ${error.message}`);
    }
}

// Função simplificada para verificar se pode pagar antecipadamente
export async function canPayAdvance(billId) {
    const user = auth.currentUser;
    if (!user) return false;
    
    try {
        // Calcular próximo período
        const today = new Date();
        const nextMonth = today.getMonth() + 1;
        const nextYear = nextMonth > 11 ? today.getFullYear() + 1 : today.getFullYear();
        const adjustedNextMonth = nextMonth > 11 ? 1 : nextMonth + 1;
        const nextPeriod = `${nextYear}-${adjustedNextMonth.toString().padStart(2, '0')}`;
        
        // Verificar se já foi pago para o próximo período
        const nextPeriodQuery = query(
            collection(db, 'transactions'),
            where('userId', '==', user.uid),
            where('billId', '==', billId),
            where('type', '==', 'expense'),
            where('isBillPayment', '==', true),
            where('paymentPeriod', '==', nextPeriod)
        );
        
        const nextPeriodSnapshot = await getDocs(nextPeriodQuery);
        const nextPeriodPaid = nextPeriodSnapshot.docs.reduce((sum, doc) => {
            const data = doc.data();
            return sum + (data.amount || 0);
        }, 0);
        
        // Buscar dados da conta fixa
        const billRef = doc(db, 'users', user.uid, 'recurring_bills', billId);
        const billDoc = await getDoc(billRef);
        
        if (!billDoc.exists()) return false;
        
        const billData = billDoc.data();
        
        // Pode pagar antecipadamente se próximo período não foi pago completamente
        return nextPeriodPaid < billData.amount;
        
    } catch (error) {
        console.error('Erro ao verificar pagamento antecipado:', error);
        return false;
    }
}

// Função para obter status detalhado de um mês específico
export async function getMonthPaymentStatus(billId, year, month) {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuário não autenticado');
    
    try {
        const period = `${year}-${month.toString().padStart(2, '0')}`;
        
        // Buscar dados da conta fixa
        const billRef = doc(db, 'users', user.uid, 'recurring_bills', billId);
        const billDoc = await getDoc(billRef);
        
        if (!billDoc.exists()) {
            throw new Error('Conta fixa não encontrada');
        }
        
        const billData = billDoc.data();
        
        // Buscar pagamentos deste período
        const paymentsQuery = query(
            collection(db, 'transactions'),
            where('userId', '==', user.uid),
            where('billId', '==', billId),
            where('type', '==', 'expense'),
            where('isBillPayment', '==', true),
            where('paymentPeriod', '==', period)
        );
        
        const paymentsSnapshot = await getDocs(paymentsQuery);
        const payments = [];
        let totalPaid = 0;
        
        paymentsSnapshot.forEach((doc) => {
            const data = doc.data();
            payments.push({
                id: doc.id,
                amount: data.amount,
                date: data.date,
                description: data.description,
                paymentType: data.paymentType || 'full'
            });
            totalPaid += data.amount || 0;
        });
        
        const remainingAmount = billData.amount - totalPaid;
        const isFullyPaid = remainingAmount <= 0;
        const hasPartialPayment = totalPaid > 0 && !isFullyPaid;
        
        // CORREÇÃO: Calcular data de vencimento para este mês
        const dueDate = new Date(year, month - 1, billData.dueDay);
        const today = new Date();
        
        // CORREÇÃO: Verificar se está realmente vencido
        // Só está vencido se:
        // 1. É o mês atual E já passou do dia de vencimento
        // 2. OU é um mês passado E não foi pago
        const isCurrentMonth = year === today.getFullYear() && month === (today.getMonth() + 1);
        const isPastMonth = (year < today.getFullYear()) || (year === today.getFullYear() && month < (today.getMonth() + 1));
        
        const isOverdue = (isCurrentMonth && today.getDate() > billData.dueDay && !isFullyPaid) || 
                         (isPastMonth && !isFullyPaid);
        
        // Determinar status visual
        let status = 'pending';
        let statusText = 'Pendente';
        let statusClass = 'text-blue-400';
        let statusIcon = '⏳';
        
        if (isFullyPaid) {
            status = 'paid';
            statusText = 'Pago';
            statusClass = 'text-green-400';
            statusIcon = '✅';
        } else if (hasPartialPayment) {
            status = 'partial';
            statusText = 'Pago Parcial';
            statusClass = 'text-yellow-400';
            statusIcon = '⚠️';
        } else if (isOverdue) {
            status = 'overdue';
            statusText = 'Vencido';
            statusClass = 'text-red-400';
            statusIcon = '❌';
        }
        
        return {
            period,
            year,
            month,
            monthName: new Date(year, month - 1).toLocaleDateString('pt-BR', { month: 'long' }),
            totalAmount: billData.amount,
            totalPaid,
            remainingAmount,
            isFullyPaid,
            hasPartialPayment,
            isOverdue,
            status,
            statusText,
            statusClass,
            statusIcon,
            dueDate: dueDate.toISOString(),
            payments,
            canPay: remainingAmount > 0,
            isCurrentMonth: year === today.getFullYear() && month === (today.getMonth() + 1)
        };
        
    } catch (error) {
        throw new Error(`Erro ao obter status do mês: ${error.message}`);
    }
}

// Função otimizada para obter status de múltiplos meses (versão rápida)
export async function getMultipleMonthsStatusOptimized(billId, monthsCount = 12) {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuário não autenticado');
    
    try {
        // Buscar dados da conta fixa uma única vez
        const billRef = doc(db, 'users', user.uid, 'recurring_bills', billId);
        const billDoc = await getDoc(billRef);
        
        if (!billDoc.exists()) {
            throw new Error('Conta fixa não encontrada');
        }
        
        const billData = billDoc.data();
        
        // Buscar TODOS os pagamentos desta conta fixa de uma vez
        const paymentsQuery = query(
            collection(db, 'transactions'),
            where('userId', '==', user.uid),
            where('billId', '==', billId),
            where('type', '==', 'expense'),
            where('isBillPayment', '==', true),
            limit(200) // Limitar para evitar sobrecarga
        );
        
        const paymentsSnapshot = await getDocs(paymentsQuery);
        const allPayments = [];
        
        paymentsSnapshot.forEach((doc) => {
            const data = doc.data();
            allPayments.push({
                id: doc.id,
                ...data
            });
        });
        
        // Agrupar pagamentos por período no cliente
        const paymentsByPeriod = {};
        allPayments.forEach(payment => {
            const period = payment.paymentPeriod || 'sem-período';
            if (!paymentsByPeriod[period]) {
                paymentsByPeriod[period] = [];
            }
            paymentsByPeriod[period].push(payment);
        });
        
        // Calcular status para cada mês
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth() + 1;
        
        const monthsStatus = [];
        
        for (let i = 0; i < monthsCount; i++) {
            const targetMonth = currentMonth + i;
            const targetYear = targetMonth > 12 ? currentYear + 1 : currentYear;
            const adjustedMonth = targetMonth > 12 ? targetMonth - 12 : targetMonth;
            
            const period = `${targetYear}-${adjustedMonth.toString().padStart(2, '0')}`;
            const periodPayments = paymentsByPeriod[period] || [];
            
            // Calcular valores
            const totalPaid = periodPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
            const remainingAmount = billData.amount - totalPaid;
            const isFullyPaid = remainingAmount <= 0;
            const hasPartialPayment = totalPaid > 0 && !isFullyPaid;
            
            // Calcular data de vencimento
            const dueDate = new Date(targetYear, adjustedMonth - 1, billData.dueDay);
            const isCurrentMonth = targetYear === today.getFullYear() && adjustedMonth === (today.getMonth() + 1);
            const isPastMonth = (targetYear < today.getFullYear()) || (targetYear === today.getFullYear() && adjustedMonth < (today.getMonth() + 1));
            
            const isOverdue = (isCurrentMonth && today.getDate() > billData.dueDay && !isFullyPaid) || 
                             (isPastMonth && !isFullyPaid);
            
            // Determinar status visual
            let status = 'pending';
            let statusText = 'Pendente';
            let statusClass = 'text-blue-400';
            let statusIcon = '⏳';
            
            if (isFullyPaid) {
                status = 'paid';
                statusText = 'Pago';
                statusClass = 'text-green-400';
                statusIcon = '✅';
            } else if (hasPartialPayment) {
                status = 'partial';
                statusText = 'Pago Parcial';
                statusClass = 'text-yellow-400';
                statusIcon = '⚠️';
            } else if (isOverdue) {
                status = 'overdue';
                statusText = 'Vencido';
                statusClass = 'text-red-400';
                statusIcon = '❌';
            }
            
            monthsStatus.push({
                period,
                year: targetYear,
                month: adjustedMonth,
                monthName: new Date(targetYear, adjustedMonth - 1).toLocaleDateString('pt-BR', { month: 'long' }),
                totalAmount: billData.amount,
                totalPaid,
                remainingAmount,
                isFullyPaid,
                hasPartialPayment,
                isOverdue,
                status,
                statusText,
                statusClass,
                statusIcon,
                dueDate: dueDate.toISOString(),
                payments: periodPayments,
                canPay: remainingAmount > 0,
                isCurrentMonth: targetYear === today.getFullYear() && adjustedMonth === (today.getMonth() + 1)
            });
        }
        
        return monthsStatus;
        
    } catch (error) {
        throw new Error(`Erro ao obter status de múltiplos meses: ${error.message}`);
    }
}

// Função para pagar múltiplas parcelas de uma vez
export async function payMultiplePeriods(billId, periodsToPay, accountId) {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuário não autenticado');
    
    try {
        // Validar se há períodos para pagar
        if (!periodsToPay || periodsToPay.length === 0) {
            throw new Error('Nenhum período selecionado para pagamento');
        }
        
        // Buscar dados da conta fixa
        const billRef = doc(db, 'users', user.uid, 'recurring_bills', billId);
        const billDoc = await getDoc(billRef);
        
        if (!billDoc.exists()) {
            throw new Error('Conta fixa não encontrada');
        }
        
        const billData = billDoc.data();
        
        // Buscar dados da conta de pagamento
        const accountRef = doc(db, 'accounts', accountId);
        const accountDoc = await getDoc(accountRef);
        
        if (!accountDoc.exists()) {
            throw new Error('Conta de pagamento não encontrada');
        }
        
        const accountData = accountDoc.data();
        
        // Verificar se a conta pertence ao usuário
        if (accountData.userId !== user.uid) {
            throw new Error('Conta não pertence ao usuário');
        }
        
        // Calcular total a pagar
        let totalToPay = 0;
        const paymentDetails = [];
        
        for (const period of periodsToPay) {
            // Verificar status atual do período
            const monthStatus = await getMonthPaymentStatus(billId, period.year, period.month);
            
            if (monthStatus.isFullyPaid) {
                throw new Error(`Período ${monthStatus.monthName} ${period.year} já foi pago completamente`);
            }
            
            const amountToPay = monthStatus.remainingAmount;
            totalToPay += amountToPay;
            
            paymentDetails.push({
                period: monthStatus.period,
                monthName: monthStatus.monthName,
                year: period.year,
                amount: amountToPay,
                remainingBefore: monthStatus.totalPaid
            });
        }
        
        // Verificar saldo suficiente
        if (accountData.balance < totalToPay) {
            throw new Error(`Saldo insuficiente. Necessário: R$ ${totalToPay.toFixed(2)}, Disponível: R$ ${accountData.balance.toFixed(2)}`);
        }
        
        // Executar pagamentos como transação atômica
        return runTransaction(db, async (transaction) => {
            // Atualizar saldo da conta
            const newBalance = accountData.balance - totalToPay;
            transaction.update(accountRef, {
                balance: newBalance,
                updatedAt: serverTimestamp()
            });
            
            // Criar transações para cada período
            const paymentResults = [];
            
            for (const detail of paymentDetails) {
                const paymentTransactionRef = doc(collection(db, 'transactions'));
                transaction.set(paymentTransactionRef, {
                    userId: user.uid,
                    accountId: accountId,
                    accountName: accountData.name,
                    amount: detail.amount,
                    description: `Pagamento múltiplo - ${billData.description} (${detail.monthName} ${detail.year})`,
                    type: 'expense',
                    category: billData.category || 'outros',
                    date: serverTimestamp(),
                    createdAt: serverTimestamp(),
                    isBillPayment: true,
                    billId: billId,
                    billDescription: billData.description,
                    paymentPeriod: detail.period,
                    paymentType: 'multiple',
                    dueDay: billData.dueDay,
                    isMultiplePayment: true,
                    multiplePaymentGroup: `${billId}_${Date.now()}`
                });
                
                paymentResults.push({
                    period: detail.period,
                    monthName: detail.monthName,
                    year: detail.year,
                    amount: detail.amount,
                    transactionId: paymentTransactionRef.id
                });
            }
            
            return {
                success: true,
                totalPaid: totalToPay,
                periodsPaid: paymentDetails.length,
                paymentResults,
                newBalance
            };
        });
        
    } catch (error) {
        throw new Error(`Erro ao pagar múltiplas parcelas: ${error.message}`);
    }
}

// Função otimizada para obter informações completas de uma conta fixa (versão rápida)
export async function getFixedBillInfoOptimized(billId) {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuário não autenticado');
    
    try {
        console.log('🚀 Carregando informações otimizadas da conta fixa...');
        
        // Buscar dados da conta fixa uma única vez
        const billRef = doc(db, 'users', user.uid, 'recurring_bills', billId);
        const billDoc = await getDoc(billRef);
        
        if (!billDoc.exists()) {
            throw new Error('Conta fixa não encontrada');
        }
        
        const billData = billDoc.data();
        const initialDate = billData.initialDate?.toDate ? billData.initialDate.toDate() : new Date(billData.initialDate);
        
        // Buscar TODOS os pagamentos desta conta fixa de uma vez
        const paymentsQuery = query(
            collection(db, 'transactions'),
            where('userId', '==', user.uid),
            where('billId', '==', billId),
            where('type', '==', 'expense'),
            where('isBillPayment', '==', true),
            limit(200) // Limitar para evitar sobrecarga
        );
        
        const paymentsSnapshot = await getDocs(paymentsQuery);
        const allPayments = [];
        
        paymentsSnapshot.forEach((doc) => {
            const data = doc.data();
            allPayments.push({
                id: doc.id,
                ...data
            });
        });
        
        // Agrupar pagamentos por período no cliente
        const paymentsByPeriod = {};
        allPayments.forEach(payment => {
            const period = payment.paymentPeriod || 'sem-período';
            if (!paymentsByPeriod[period]) {
                paymentsByPeriod[period] = [];
            }
            paymentsByPeriod[period].push(payment);
        });
        
        // Calcular períodos usando a função otimizada
        const totalPeriods = billData.totalPeriodsGenerated || 12;
        const allPeriods = calculateAllPeriodsFromInitial(initialDate, billData.dueDay, totalPeriods, false);
        
        // Calcular status de todos os períodos no cliente (muito mais rápido)
        const periodsStatus = [];
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth() + 1;
        
        allPeriods.forEach(period => {
            const periodPayments = paymentsByPeriod[period.period] || [];
            const totalPaid = periodPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
            const remainingAmount = billData.amount - totalPaid;
            const isFullyPaid = remainingAmount <= 0;
            const hasPartialPayment = totalPaid > 0 && !isFullyPaid;
            
            // Calcular data de vencimento
            const dueDate = new Date(period.year, period.month - 1, billData.dueDay);
            const isCurrentMonth = period.year === currentYear && period.month === currentMonth;
            const isPastMonth = (period.year < currentYear) || (period.year === currentYear && period.month < currentMonth);
            
            const isOverdue = (isCurrentMonth && today.getDate() > billData.dueDay && !isFullyPaid) || 
                             (isPastMonth && !isFullyPaid);
            
            // Determinar status visual
            let status = 'pending';
            let statusText = 'Pendente';
            let statusClass = 'text-blue-400';
            let statusIcon = '⏳';
            
            if (isFullyPaid) {
                status = 'paid';
                statusText = 'Pago';
                statusClass = 'text-green-400';
                statusIcon = '✅';
            } else if (hasPartialPayment) {
                status = 'partial';
                statusText = 'Pago Parcial';
                statusClass = 'text-yellow-400';
                statusIcon = '⚠️';
            } else if (isOverdue) {
                status = 'overdue';
                statusText = 'Vencido';
                statusClass = 'text-red-400';
                statusIcon = '❌';
            }
            
            periodsStatus.push({
                period: period.period,
                year: period.year,
                month: period.month,
                monthName: period.monthName,
                totalAmount: billData.amount,
                totalPaid,
                remainingAmount,
                isFullyPaid,
                hasPartialPayment,
                isOverdue,
                status,
                statusText,
                statusClass,
                statusIcon,
                dueDate: dueDate.toISOString(),
                payments: periodPayments,
                canPay: remainingAmount > 0,
                isCurrentMonth: period.year === currentYear && period.month === currentMonth
            });
        });
        
        // Calcular estatísticas
        const statistics = {
            paidMonths: periodsStatus.filter(p => p.isFullyPaid).length,
            partialMonths: periodsStatus.filter(p => p.hasPartialPayment).length,
            overdueMonths: periodsStatus.filter(p => p.isOverdue).length,
            pendingMonths: periodsStatus.filter(p => p.status === 'pending').length
        };
        
        // Identificar próximos períodos para pagamento
        const nextPeriodsToPay = periodsStatus.filter(period => 
            period.canPay && !period.isOverdue
        ).slice(0, 3); // Limitar a 3 períodos para performance
        
        // Determinar capacidades de pagamento
        const currentPeriod = periodsStatus.find(p => p.isCurrentMonth);
        const canPayCurrent = currentPeriod && currentPeriod.canPay;
        const canPayNext = nextPeriodsToPay.length > 0;
        const canPayMultiple = nextPeriodsToPay.length > 1;
        
        console.log('✅ Informações da conta fixa carregadas com sucesso!');
        
        return {
            billId,
            billDescription: billData.description || billData.name,
            totalAmount: billData.amount,
            dueDay: billData.dueDay,
            initialDate: initialDate.toISOString(),
            totalPeriodsGenerated: totalPeriods,
            periodsStatus,
            statistics,
            nextPeriodsToPay,
            canPayCurrent,
            canPayNext,
            canPayMultiple,
            nextPeriodsAvailable: nextPeriodsToPay.length,
            expansionInfo: {
                expanded: false, // Simplificado para performance
                autoExpansionEnabled: billData.autoExpansionEnabled || false,
                periodsRemaining: Math.max(0, totalPeriods - periodsStatus.length),
                totalPeriodsGenerated: totalPeriods,
                lastExpansion: billData.lastExpansion || null,
                message: 'Sistema otimizado'
            }
        };
        
    } catch (error) {
        throw new Error(`Erro ao obter informações da conta fixa: ${error.message}`);
    }
}

// Função para obter informações completas de uma conta fixa para o frontend CORRIGIDA
export async function getFixedBillInfo(billId) {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuário não autenticado');
    
    try {
        // Buscar dados da conta fixa
        const billRef = doc(db, 'users', user.uid, 'recurring_bills', billId);
        const billDoc = await getDoc(billRef);
        
        if (!billDoc.exists()) {
            throw new Error('Conta fixa não encontrada');
        }
        
        const billData = billDoc.data();
        const initialDate = billData.initialDate?.toDate ? billData.initialDate.toDate() : new Date(billData.initialDate);
        
        // Obter status atual
        const status = await getFixedBillStatus(billId);
        
        // Verificar se precisa expandir períodos automaticamente
        const expansionResult = await checkAndExpandPeriods(billId);
        
        // Calcular todos os períodos desde a data inicial (usando total de períodos gerados)
        const totalPeriods = billData.totalPeriodsGenerated || 12;
        
        const allPeriods = calculateAllPeriodsFromInitial(initialDate, billData.dueDay, totalPeriods, false);
        
        // Obter status de cada período
        const periodsStatus = [];
        for (const period of allPeriods) {
            try {
                const periodStatus = await getMonthPaymentStatus(billId, period.year, period.month);
                periodsStatus.push(periodStatus);
            } catch (error) {
                console.warn(`Erro ao obter status do período ${period.period}:`, error);
                // Adicionar período com erro
                periodsStatus.push({
                    period: period.period,
                    year: period.year,
                    month: period.month,
                    monthName: period.monthName,
                    error: true,
                    statusText: 'Erro',
                    statusClass: 'text-gray-400',
                    statusIcon: '❓'
                });
            }
        }
        
        // Calcular estatísticas
        const totalMonths = periodsStatus.length;
        const paidMonths = periodsStatus.filter(m => m.isFullyPaid).length;
        const partialMonths = periodsStatus.filter(m => m.hasPartialPayment).length;
        const pendingMonths = periodsStatus.filter(m => !m.isFullyPaid && !m.hasPartialPayment).length;
        const overdueMonths = periodsStatus.filter(m => m.isOverdue).length;
        
        // Calcular valores
        const totalAmount = periodsStatus.reduce((sum, m) => sum + (m.totalAmount || 0), 0);
        const totalPaid = periodsStatus.reduce((sum, m) => sum + (m.totalPaid || 0), 0);
        const totalRemaining = periodsStatus.reduce((sum, m) => sum + (m.remainingAmount || 0), 0);
        
        // Encontrar períodos disponíveis para pagamento
        const nextPeriodsToPay = periodsStatus
            .filter(m => m.canPay && !m.error)
            .slice(0, 6); // Próximos 6 períodos
        
        // Botão sempre visível com informações claras
        const paymentInfo = {
            canPayCurrent: status.remainingAmount > 0,
            canPayNext: status.canPayNextPeriod,
            canPayMultiple: nextPeriodsToPay.length > 0,
            currentPeriodAmount: status.remainingAmount,
            nextPeriodsAvailable: nextPeriodsToPay.length,
            totalRemaining: totalRemaining
        };
        
        // Obter último período pago para mostrar na interface
        const lastPaidPeriod = periodsStatus
            .filter(m => m.isFullyPaid)
            .sort((a, b) => b.period.localeCompare(a.period))[0];
        
        return {
            ...status,
            periodsStatus,
            statistics: {
                totalMonths,
                paidMonths,
                partialMonths,
                pendingMonths,
                overdueMonths,
                totalAmount,
                totalPaid,
                totalRemaining,
                completionPercentage: totalMonths > 0 ? (paidMonths / totalMonths) * 100 : 0
            },
            nextPeriodsToPay,
            paymentInfo,
            // Informações para interface
            canPayMultiple: nextPeriodsToPay.length > 0,
            hasOverdue: overdueMonths > 0,
            hasPartial: partialMonths > 0,
            // Botão sempre visível
            showPaymentButton: true,
            paymentButtonText: getPaymentButtonText(status, paymentInfo),
            // Último período pago para mostrar na interface
            lastPaidPeriod: lastPaidPeriod ? {
                period: lastPaidPeriod.period,
                monthName: lastPaidPeriod.monthName,
                year: lastPaidPeriod.year,
                amount: lastPaidPeriod.totalAmount
            } : null,
            // Informações de debug
            debug: {
                currentPeriod: status.currentPeriod,
                totalMonthsAnalyzed: totalMonths,
                nextPeriodsAvailable: nextPeriodsToPay.length,
                paymentInfo: paymentInfo,
                initialDate: initialDate,
                firstPeriod: billData.firstPeriod
            },
            // Informações sobre auto-expansão
            expansionInfo: {
                expanded: expansionResult.expanded,
                periodsRemaining: expansionResult.periodsRemaining,
                totalPeriodsGenerated: totalPeriods,
                autoExpansionEnabled: billData.autoExpansionEnabled || false,
                lastExpansion: billData.lastExpansion,
                message: expansionResult.message
            }
        };
        
    } catch (error) {
        throw new Error(`Erro ao obter informações da conta fixa: ${error.message}`);
    }
}

// Função auxiliar para determinar texto do botão de pagamento
function getPaymentButtonText(status, paymentInfo) {
    if (paymentInfo.canPayCurrent) {
        if (status.isOverdue) {
            return `💳 Pagar ${status.billDescription} (Vencida) - R$ ${status.remainingAmount.toFixed(2)}`;
        } else if (status.hasPartialPayment) {
            return `💳 Completar Pagamento - R$ ${status.remainingAmount.toFixed(2)}`;
        } else {
            return `💳 Pagar ${status.billDescription} - R$ ${status.remainingAmount.toFixed(2)}`;
        }
    } else if (paymentInfo.canPayNext) {
        return `🚀 Pagar Próximo Período - R$ ${status.totalAmount.toFixed(2)}`;
    } else if (paymentInfo.canPayMultiple) {
        return `🚀 Pagar Múltiplas Parcelas (${paymentInfo.nextPeriodsAvailable} disponíveis)`;
    } else {
        return `✅ ${status.billDescription} - Todos os períodos pagos`;
    }
}
