// Importe o app do firebase-config.js
import { auth, db } from './firebase-config.js';
import { 
    onAuthStateChanged, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

// Importe as funções do serviço do Firestore
import {
    createUserDocument,
    addAccount,
    onAccountsUpdate,
    addTransaction,
    onTransactionsUpdate,
    updateAccountBalance,
    deleteAccount,
    getFinancialStats,
    performTransfer,
    addRecurringBill,
    getRecurringBills,
    updateRecurringBill,
    deleteRecurringBill,
    getTransactionsByDateRange,
    reverseTransaction,
    updateTransaction,
    initializeIndexes,
    clearTestData,
    countTransactionsByAccount,
    fixNegativeBalances,
    checkFinancialIntegrity
} from './firestoreService.js';

// Importe o processador de chat
import { processChatMessage, processChatMessageAdvanced, processClarificationResponse } from './chatProcessor.js';

// Seletores de DOM para os principais elementos
const loginScreen = document.getElementById('login-screen');
const appScreen = document.getElementById('app-screen');
const loginForm = document.getElementById('login-form');
const loginBtn = document.getElementById('login-btn');
const signupBtn = document.getElementById('signup-btn');
const logoutBtn = document.getElementById('logout-btn');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const chatInput = document.getElementById('chat-input');
const sendChatBtn = document.getElementById('send-chat-btn');
const chatMessages = document.getElementById('chat-messages');
const authError = document.getElementById('auth-error');

// Seletores para o formulário de transações
const transactionForm = document.getElementById('transaction-form');
const transactionDescription = document.getElementById('transaction-description');
const transactionAmount = document.getElementById('transaction-amount');
const transactionType = document.getElementById('transaction-type');
const transactionAccount = document.getElementById('transaction-account');
const addTransactionBtn = document.getElementById('add-transaction-btn');

// Seletores para estatísticas
const totalBalanceEl = document.getElementById('total-balance');
const monthlyIncomeEl = document.getElementById('monthly-income');
const monthlyExpensesEl = document.getElementById('monthly-expenses');

// Seletores para o modal de ajuda
const helpBtn = document.getElementById('help-btn');
const helpModal = document.getElementById('help-modal');
const closeHelpModal = document.getElementById('close-help-modal');



// Seletores para o menu mobile
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebar-overlay');

// Seletores para o sistema de abas
const tabButtons = document.querySelectorAll('.tab-btn');
const tabPanels = document.querySelectorAll('.tab-panel');

// Seletores para o painel de contas rápido
const toggleAccountsBtn = document.getElementById('toggle-accounts-btn');
const quickAccountsPanel = document.getElementById('quick-accounts-panel');

// Seletores para contas fixas
const toggleFixedBillsBtn = document.getElementById('toggle-fixed-bills-btn');
const fixedBillCreationMode = document.getElementById('fixed-bill-creation-mode');
const fixedBillsList = document.getElementById('fixed-bills-list');

// Seletores para contas fixas
const showFixedBillsModalBtnOverview = document.getElementById('show-fixed-bills-modal-btn-overview');
const showFixedBillsModalBtnTab = document.getElementById('show-fixed-bills-modal-btn-tab');
const manageFixedBillsModal = document.getElementById('manage-fixed-bills-modal');
const closeManageFixedBillsBtn = document.getElementById('close-manage-fixed-bills-btn');
const addFixedBillForm = document.getElementById('add-fixed-bill-form');
const modalFixedBillsList = document.getElementById('modal-fixed-bills-list');

// Estado da aplicação
let currentUser = null;
let isAuthenticated = false;
let accounts = [];
let transactions = [];
let unsubscribeAccounts = null;
let unsubscribeTransactions = null;

// Estado para paginação de transações
let transactionPage = 0;
let transactionLimit = 20; // Limite inicial de transações
let hasMoreTransactions = true;
let isLoadingTransactions = false;

// Estado do chat para ações pendentes
let pendingChatAction = null;

// Estado para contas fixas
let fixedBills = [];
let pendingFixedBillData = null;

// Variável global para armazenar a última transação bem-sucedida
let lastTransaction = null;

// Contexto da conversa para memória de curto prazo


let conversationContext = { lastIntent: null, pendingQuestion: null };

// Função para verificar se a mensagem indica cancelamento
function isCancellationMessage(message) {
    const cancellationKeywords = [
        'cancelar', 'cancela', 'cancele', 'cancelo',
        'deixa pra lá', 'deixa pra la', 'deixa pra lá', 'deixa pra la',
        'deixa', 'deixe', 'deixo',
        'esquece', 'esqueça', 'esqueço',
        'não quero mais', 'nao quero mais', 'não quero', 'nao quero',
        'trocar de assunto', 'mudar de assunto', 'outro assunto',
        'fazer outra coisa', 'outra coisa', 'outro negócio',
        'parar', 'para', 'pare',
        'voltar', 'volta', 'volte',
        'sair', 'saia', 'saio',
        'fim', 'terminar', 'termina', 'termine'
    ];
    
    const normalizedMessage = message.toLowerCase().trim();
    
    // Verificar palavras-chave exatas
    for (const keyword of cancellationKeywords) {
        if (normalizedMessage === keyword) {
            return true;
        }
    }
    
    // Verificar se contém palavras-chave
    for (const keyword of cancellationKeywords) {
        if (normalizedMessage.includes(keyword)) {
            return true;
        }
    }
    
    // Verificar frases específicas
    const specificPhrases = [
        'deixa pra lá',
        'deixa pra la',
        'deixa isso pra lá',
        'deixa isso pra la',
        'não quero mais fazer isso',
        'nao quero mais fazer isso',
        'quero fazer outra coisa',
        'vamos falar de outra coisa',
        'mudar de assunto',
        'trocar de assunto'
    ];
    
    for (const phrase of specificPhrases) {
        if (normalizedMessage.includes(phrase)) {
            return true;
        }
    }
    
    return false;
}

// Função para gerenciar o sistema de abas
function initTabSystem() {
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            switchTab(targetTab);
        });
    });
}

// Função para alternar entre abas
function switchTab(tabName) {
    // Remove classe ativa de todos os botões
    tabButtons.forEach(btn => {
        btn.classList.remove('active', 'bg-white', 'text-blue-600', 'shadow-sm');
        btn.classList.add('text-gray-600');
    });
    
    // Esconde todos os painéis
    tabPanels.forEach(panel => {
        panel.classList.add('hidden');
    });
    
    // Ativa a aba selecionada
    const activeButton = document.querySelector(`[data-tab="${tabName}"]`);
    const activePanel = document.getElementById(`tab-${tabName}-content`);
    
    if (activeButton && activePanel) {
        activeButton.classList.add('active');
        activeButton.classList.remove('text-gray-600');
        activePanel.classList.remove('hidden');
    }
}

// Função para gerenciar o painel de contas rápido
function initQuickAccountsPanel() {
    if (toggleAccountsBtn && quickAccountsPanel) {
        toggleAccountsBtn.addEventListener('click', toggleQuickAccounts);
    }
}

function initFixedBillsPanel() {
    initFixedBillsModal();
}

// Função para alternar visibilidade do painel de contas
function toggleQuickAccounts() {
    if (!quickAccountsPanel) return;
    
    const isVisible = !quickAccountsPanel.classList.contains('hidden');
    
    if (isVisible) {
        // Oculta o painel
        hideQuickAccounts();
    } else {
        // Mostra o painel
        showQuickAccounts();
    }
}

// Função para alternar modo de criação de contas fixas
function toggleFixedBillCreationMode() {
    if (!toggleFixedBillsBtn) return;
    
    isFixedBillCreationMode = !isFixedBillCreationMode;
    
    if (isFixedBillCreationMode) {
        // Ativar modo de criação
        fixedBillCreationMode.classList.remove('hidden');
        addChatMessage('Dinah', '🔧 Modo de criação de conta fixa mensal ativado! Agora você pode usar o chat para criar suas contas fixas. Ex: "aluguel 1500 reais, dia 10"', 'chatbot');
    } else {
        // Desativar modo de criação
        fixedBillCreationMode.classList.add('hidden');
        addChatMessage('Dinah', '✅ Modo de criação de conta fixa mensal desativado.', 'chatbot');
    }
}

// Função para mostrar o painel de contas
function showQuickAccounts() {
    if (!quickAccountsPanel) return;
    
    quickAccountsPanel.classList.remove('hidden');
    quickAccountsPanel.classList.add('show');
    toggleAccountsBtn.classList.add('active');
    
    // Auto-ocultação após 5 segundos
    setTimeout(() => {
        hideQuickAccounts();
    }, 5000);
}

// Função para ocultar o painel de contas
function hideQuickAccounts() {
    if (!quickAccountsPanel) return;
    
    quickAccountsPanel.classList.remove('show');
    quickAccountsPanel.classList.add('hidden');
    toggleAccountsBtn.classList.remove('active');
}

// Função para renderizar contas no painel rápido
function renderQuickAccounts(accountsList) {
    if (!quickAccountsPanel) return;
    
    if (accountsList.length === 0) {
        quickAccountsPanel.innerHTML = `
            <div class="text-center py-3">
                <p class="text-gray-500 text-xs">Nenhuma conta criada</p>
            </div>
        `;
        return;
    }
    
    // Mostra apenas as 3 primeiras contas no painel rápido
    const quickAccounts = accountsList.slice(0, 3);
    
    quickAccountsPanel.innerHTML = quickAccounts.map(account => `
        <div class="quick-account-item">
            <div class="flex justify-between items-center">
                <span class="text-sm font-medium text-gray-700">${account.name}</span>
                <span class="text-sm font-bold ${account.balance >= 0 ? 'text-green-600' : 'text-red-600'}">
                    R$ ${account.balance.toFixed(2)}
                </span>
            </div>
        </div>
    `).join('');
    
    // Se há mais contas, mostra indicador
    if (accountsList.length > 3) {
        quickAccountsPanel.innerHTML += `
            <div class="text-center py-2">
                <p class="text-xs text-gray-500">+${accountsList.length - 3} contas adicionais</p>
            </div>
        `;
    }
}

// Função para alternar entre as telas
function showLoginScreen() {
    loginScreen.classList.remove('hidden');
    appScreen.classList.add('hidden');
    isAuthenticated = false;
}

// Função para controlar o menu mobile
function toggleMobileMenu() {
    if (sidebar.classList.contains('active')) {
        closeMobileMenu();
    } else {
        openMobileMenu();
    }
}

function openMobileMenu() {
    sidebar.classList.add('active');
    sidebarOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeMobileMenu() {
    sidebar.classList.remove('active');
    sidebarOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

// Função para fechar o menu ao clicar no overlay
function handleSidebarOverlayClick() {
    closeMobileMenu();
}

function showAppScreen() {
    loginScreen.classList.add('hidden');
    appScreen.classList.remove('hidden');
    isAuthenticated = true;
}

// Função para adicionar mensagem no chat
function addChatMessage(message, isUser = false) {
    // Evitar exibir mensagens vazias ou apenas espaços
    if (typeof message !== 'string' || message.trim() === '') {
        return;
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `flex ${isUser ? 'justify-end' : 'justify-start'} chat-message ${isUser ? 'user' : 'assistant'}`;
    
    if (isUser) {
        // Mensagem do usuário
        const messageBubble = document.createElement('div');
        messageBubble.className = 'px-4 py-3 rounded-2xl max-w-2xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg';
        messageBubble.textContent = message;
        messageDiv.appendChild(messageBubble);
    } else {
        // Mensagem do assistente
        const messageContainer = document.createElement('div');
        messageContainer.className = 'flex items-start space-x-3 max-w-3xl';
        
        const avatar = document.createElement('div');
        avatar.className = 'w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0';
        avatar.innerHTML = '<span class="text-white text-sm">🤖</span>';
        
        const messageBubble = document.createElement('div');
        messageBubble.className = 'assistant-message rounded-2xl px-4 py-3 shadow-sm';
        
        // Processar formatação markdown básica e quebras de linha
        let formattedMessage = message.replace(/\n/g, '<br>');
        
        // Formatação básica de markdown
        formattedMessage = formattedMessage
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // **texto** -> <strong>texto</strong>
            .replace(/\*(.*?)\*/g, '<em>$1</em>'); // *texto* -> <em>texto</em>
        
        messageBubble.innerHTML = formattedMessage;
        
        messageContainer.appendChild(avatar);
        messageContainer.appendChild(messageBubble);
        messageDiv.appendChild(messageContainer);
    }
    
    chatMessages.appendChild(messageDiv);
    
    // Scroll para a última mensagem com animação suave
    setTimeout(() => {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 100);
}

// Função para fazer login com Firebase Auth
async function handleLogin(event) {
    event.preventDefault();
    
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    
    if (!email || !password) {
        showAuthError('Por favor, preencha todos os campos.');
        return;
    }
    
    // Loading
    loginBtn.textContent = 'Entrando...';
    loginBtn.disabled = true;
    signupBtn.disabled = true;
    hideAuthError();
    
    try {
        await signInWithEmailAndPassword(auth, email, password);
        // onAuthStateChanged irá lidar com a mudança de tela
    } catch (error) {
        console.error('Erro no login:', error);
        let errorMessage = 'Erro ao fazer login.';
        
        switch (error.code) {
            case 'auth/user-not-found':
                errorMessage = 'Usuário não encontrado.';
                break;
            case 'auth/wrong-password':
                errorMessage = 'Senha incorreta.';
                break;
            case 'auth/invalid-email':
                errorMessage = 'Email inválido.';
                break;
            case 'auth/too-many-requests':
                errorMessage = 'Muitas tentativas. Tente novamente mais tarde.';
                break;
            default:
                errorMessage = error.message;
        }
        
        showAuthError(errorMessage);
    } finally {
        // Restaurar botões
        loginBtn.textContent = 'Entrar';
        loginBtn.disabled = false;
        signupBtn.disabled = false;
    }
}

// Função para fazer cadastro com Firebase Auth
async function handleSignup() {
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    
    if (!email || !password) {
        showAuthError('Por favor, preencha todos os campos.');
        return;
    }
    
    if (password.length < 6) {
        showAuthError('A senha deve ter pelo menos 6 caracteres.');
        return;
    }
    
    // Loading
    signupBtn.textContent = 'Cadastrando...';
    signupBtn.disabled = true;
    loginBtn.disabled = true;
    hideAuthError();
    
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Criar documento do usuário no Firestore
        await createUserDocument(userCredential.user.uid, email);
        // onAuthStateChanged irá lidar com a mudança de tela
    } catch (error) {
        console.error('Erro no cadastro:', error);
        let errorMessage = 'Erro ao criar conta.';
        
        switch (error.code) {
            case 'auth/email-already-in-use':
                errorMessage = 'Este email já está em uso.';
                break;
            case 'auth/invalid-email':
                errorMessage = 'Email inválido.';
                break;
            case 'auth/weak-password':
                errorMessage = 'A senha é muito fraca.';
                break;
            default:
                errorMessage = error.message;
        }
        
        showAuthError(errorMessage);
    } finally {
        // Restaurar botões
        signupBtn.textContent = 'Cadastrar';
        signupBtn.disabled = false;
        loginBtn.disabled = false;
    }
}

// Função para logout
async function handleLogout() {
    try {
        await signOut(auth);
        // onAuthStateChanged irá lidar com a mudança de tela
    } catch (error) {
        console.error('Erro ao fazer logout:', error);
        showAuthError('Erro ao fazer logout. Tente novamente.');
    }
}

// Funções para gerenciar mensagens de erro de autenticação
function showAuthError(message) {
    authError.textContent = message;
    authError.classList.remove('hidden');
}

function hideAuthError() {
    authError.classList.add('hidden');
}

// Função para renderizar contas na sidebar
function renderAccounts(accountsList) {
    const accountsContainer = document.querySelector('.accounts-container');
    if (!accountsContainer) {
        console.log('⚠️ Container de contas não encontrado, pulando renderização');
        return;
    }
    
    if (accountsList.length === 0) {
        accountsContainer.innerHTML = `
            <div class="text-center py-4">
                <p class="text-gray-500 text-sm">Nenhuma conta criada ainda</p>
                <button id="add-account-btn" class="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium">
                    + Adicionar primeira conta
                </button>
                <div id="add-account-form" class="hidden mt-4 p-3 bg-gray-50 rounded-lg">
                    <input type="text" id="account-name" placeholder="Nome da conta" class="w-full mb-2 px-2 py-1 text-sm border rounded">
                    <input type="number" id="account-balance" placeholder="Saldo inicial" class="w-full mb-2 px-2 py-1 text-sm border rounded">
                    <button id="save-account-btn" class="w-full bg-blue-600 text-white px-2 py-1 text-sm rounded hover:bg-blue-700">
                        Salvar
                    </button>
                </div>
            </div>
        `;
        
        // Event listeners para adicionar conta
        document.getElementById('add-account-btn')?.addEventListener('click', () => {
            document.getElementById('add-account-form').classList.remove('hidden');
        });
        
        document.getElementById('save-account-btn')?.addEventListener('click', handleAddAccount);
    } else {
        accountsContainer.innerHTML = `
            <div class="space-y-3">
                ${accountsList.map(account => `
                    <div class="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <p class="text-sm text-gray-600">${account.name}</p>
                        <p class="text-lg font-semibold text-gray-900">R$ ${account.balance.toFixed(2)}</p>
                    </div>
                `).join('')}
            </div>
            <button id="add-account-btn" class="w-full mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium">
                + Adicionar conta
            </button>
            <div id="add-account-form" class="hidden mt-4 p-3 bg-gray-50 rounded-lg">
                <input type="text" id="account-name" placeholder="Nome da conta" class="w-full mb-2 px-2 py-1 text-sm border rounded">
                <input type="number" id="account-balance" placeholder="Saldo inicial" class="w-full mb-2 px-2 py-1 text-sm border rounded">
                <button id="save-account-btn" class="w-full bg-blue-600 text-white px-2 py-1 text-sm rounded hover:bg-blue-700">
                    Salvar
                </button>
            </div>
            <button id="clear-test-data-btn" class="w-full mt-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-sm font-semibold rounded-xl py-3 px-4 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
                <span>Limpar dados de teste</span>
            </button>
            
            <button id="manage-accounts-btn" class="w-full mt-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-sm font-semibold rounded-xl py-3 px-4 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
                </svg>
                <span>Gerenciar contas</span>
            </button>
        `;
        
        // Event listeners para adicionar conta
        document.getElementById('add-account-btn')?.addEventListener('click', () => {
            document.getElementById('add-account-form').classList.toggle('hidden');
        });
        
        document.getElementById('save-account-btn')?.addEventListener('click', handleAddAccount);
        
        // Event listener para limpar dados de teste
        document.getElementById('clear-test-data-btn')?.addEventListener('click', handleClearTestData);
        
        // Event listener para gerenciar contas
        document.getElementById('manage-accounts-btn')?.addEventListener('click', showManageAccountsModal);
    }
}

// Função para adicionar nova conta
async function handleAddAccount() {
    const accountName = document.getElementById('account-name').value.trim();
    const accountBalance = document.getElementById('account-balance').value.trim();
    
    if (!accountName || !accountBalance) {
        alert('Por favor, preencha todos os campos.');
        return;
    }
    
    try {
        await addAccount(accountName, parseFloat(accountBalance));
        
        // Limpar formulário
        document.getElementById('account-name').value = '';
        document.getElementById('account-balance').value = '';
        document.getElementById('add-account-form').classList.add('hidden');
        
        // Atualizar estatísticas
        updateFinancialStats();
    } catch (error) {
        alert('Erro ao criar conta: ' + error.message);
    }
}

// Função para renderizar transações com lazy loading
function renderTransactions(transactionsList, append = false) {
    const transactionsContainer = document.getElementById('transactions-container');
    if (!transactionsContainer) {
        console.log('⚠️ Container de transações não encontrado, pulando renderização');
        return;
    }
    
    if (transactionsList.length === 0 && !append) {
        transactionsContainer.innerHTML = `
            <div class="text-center py-8">
                <p class="text-gray-500">Nenhuma transação registrada ainda</p>
            </div>
        `;
        return;
    }
    
    // Se for append, adicionar ao final. Se não, substituir tudo
    if (append) {
        // Adicionar novas transações ao final
        const newTransactionsHTML = transactionsList.map(transaction => {
            const account = accounts.find(acc => acc.id === transaction.accountId);
            const accountName = account ? account.name : 'Conta não encontrada';
            const amount = transaction.amount;
            const isExpense = transaction.type === 'expense';
            const date = transaction.createdAt ? new Date(transaction.createdAt.toDate()).toLocaleDateString('pt-BR') : 'Data não disponível';
            
            return `
                <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                        <p class="font-medium text-gray-900">${transaction.description}</p>
                        <p class="text-sm text-gray-600">${accountName} • ${date}</p>
                    </div>
                    <span class="${isExpense ? 'text-red-600' : 'text-green-600'} font-semibold">
                        ${isExpense ? '-' : '+'}R$ ${amount.toFixed(2)}
                    </span>
                </div>
            `;
        }).join('');
        
        // Remover botão "Ver Mais" se existir
        const existingLoadMoreBtn = transactionsContainer.querySelector('#load-more-transactions');
        if (existingLoadMoreBtn) {
            existingLoadMoreBtn.remove();
        }
        
        // Adicionar novas transações
        transactionsContainer.insertAdjacentHTML('beforeend', newTransactionsHTML);
    } else {
        // Substituir todas as transações
        transactionsContainer.innerHTML = transactionsList.map(transaction => {
            const account = accounts.find(acc => acc.id === transaction.accountId);
            const accountName = account ? account.name : 'Conta não encontrada';
            const amount = transaction.amount;
            const isExpense = transaction.type === 'expense';
            const date = transaction.createdAt ? new Date(transaction.createdAt.toDate()).toLocaleDateString('pt-BR') : 'Data não disponível';
            
            return `
                <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                        <p class="text-medium text-gray-900">${transaction.description}</p>
                        <p class="text-sm text-gray-600">${accountName} • ${date}</p>
                    </div>
                    <span class="${isExpense ? 'text-red-600' : 'text-green-600'} font-semibold">
                        ${isExpense ? '-' : '+'}R$ ${amount.toFixed(2)}
                    </span>
                </div>
            `;
        }).join('');
    }
    
    // Adicionar botão "Ver Mais" se houver mais transações
    if (hasMoreTransactions && !append) {
        addLoadMoreButton(transactionsContainer);
    }
}

// Função para adicionar botão "Ver Mais"
function addLoadMoreButton(container) {
    const loadMoreBtn = document.createElement('button');
    loadMoreBtn.id = 'load-more-transactions';
    loadMoreBtn.className = 'w-full mt-4 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg hover:from-blue-700 hover:to-indigo-800 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105';
    loadMoreBtn.innerHTML = `
        <span class="flex items-center justify-center space-x-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
            <span>Ver Mais Transações</span>
        </span>
    `;
    
    loadMoreBtn.addEventListener('click', loadMoreTransactions);
    container.appendChild(loadMoreBtn);
}

// Função para carregar mais transações
async function loadMoreTransactions() {
    if (isLoadingTransactions || !hasMoreTransactions) return;
    
    const loadMoreBtn = document.getElementById('load-more-transactions');
    if (loadMoreBtn) {
        loadMoreBtn.disabled = true;
        loadMoreBtn.innerHTML = `
            <span class="flex items-center justify-center space-x-2">
                <div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Carregando...</span>
            </span>
        `;
    }
    
    isLoadingTransactions = true;
    transactionPage++;
    
    try {
        // Buscar mais transações do Firebase
        const moreTransactions = await getTransactionsByDateRange(
            new Date(Date.now() - (365 * 24 * 60 * 60 * 1000)), // Último ano
            new Date(),
            transactionPage * transactionLimit,
            transactionLimit
        );
        
        if (moreTransactions && moreTransactions.length > 0) {
            // Adicionar novas transações à lista existente
            transactions = [...transactions, ...moreTransactions];
            
            // Renderizar apenas as novas transações (append)
            renderTransactions(moreTransactions, true);
            
            // Verificar se ainda há mais transações
            if (moreTransactions.length < transactionLimit) {
                hasMoreTransactions = false;
                const loadMoreBtn = document.getElementById('load-more-transactions');
                if (loadMoreBtn) {
                    loadMoreBtn.remove();
                }
            }
        } else {
            hasMoreTransactions = false;
            const loadMoreBtn = document.getElementById('load-more-transactions');
            if (loadMoreBtn) {
                loadMoreBtn.remove();
            }
        }
        
    } catch (error) {
        console.error('Erro ao carregar mais transações:', error);
        // Restaurar botão em caso de erro
        if (loadMoreBtn) {
            loadMoreBtn.disabled = false;
            loadMoreBtn.innerHTML = `
                <span class="flex items-center justify-center space-x-2">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                    <span>Ver Mais Transações</span>
                </span>
            `;
        }
    } finally {
        isLoadingTransactions = false;
    }
}

// Função para resetar paginação de transações
function resetTransactionPagination() {
    transactionPage = 0;
    hasMoreTransactions = true;
    isLoadingTransactions = false;
    
    // Remover botão "Ver Mais" se existir
    const loadMoreBtn = document.getElementById('load-more-transactions');
    if (loadMoreBtn) {
        loadMoreBtn.remove();
    }
}

// Função para buscar transações específicas via chat (sem afetar a lista principal)
async function searchTransactionsForChat(query, startDate, endDate) {
    try {
        // Buscar transações específicas do Firebase para consultas do chat
        const searchResults = await getTransactionsByDateRange(startDate, endDate, 0, 100); // Máximo 100 para consultas
        
        if (searchResults && searchResults.length > 0) {
            // Filtrar por query se fornecida
            if (query) {
                const filteredResults = searchResults.filter(transaction => 
                    transaction.description.toLowerCase().includes(query.toLowerCase()) ||
                    transaction.type.toLowerCase().includes(query.toLowerCase())
                );
                return filteredResults;
            }
            return searchResults;
        }
        return [];
    } catch (error) {
        console.error('Erro ao buscar transações para chat:', error);
        return [];
    }
}

// Função para atualizar estatísticas financeiras
async function updateFinancialStats() {
    try {
        const stats = await getFinancialStats();
        
        if (totalBalanceEl) totalBalanceEl.textContent = `R$ ${stats.totalBalance.toFixed(2)}`;
        if (monthlyIncomeEl) monthlyIncomeEl.textContent = `R$ ${stats.monthlyIncome.toFixed(2)}`;
        if (monthlyExpensesEl) monthlyExpensesEl.textContent = `R$ ${stats.monthlyExpenses.toFixed(2)}`;
    } catch (error) {
        console.error('Erro ao atualizar estatísticas:', error);
    }
}

// Função para adicionar transação
async function handleAddTransaction(event) {
    event.preventDefault();
    
    const description = transactionDescription.value.trim();
    const amount = parseFloat(transactionAmount.value);
    const type = transactionType.value;
    const accountId = transactionAccount.value;
    
    if (!description || !amount || !accountId) {
        alert('Por favor, preencha todos os campos.');
        return;
    }
    
    if (amount <= 0) {
        alert('O valor deve ser maior que zero.');
        return;
    }
    
    try {
        // Adicionar transação (já inclui validação de saldo)
        const transactionResult = await addTransaction({
            description,
            amount,
            type,
            accountId
        });
        
        // Armazenar última transação para correção
        lastTransaction = {
            id: transactionResult.id,
            description,
            amount,
            type,
            accountId,
            createdAt: new Date()
        };
        
        // O saldo já foi atualizado pelo addTransaction com validação
        // Não é necessário atualizar manualmente
        
        // Limpar formulário
        transactionForm.reset();
        
        // Atualizar estatísticas
        updateFinancialStats();
        
        // Adicionar mensagem no chat
        addChatMessage(`Transação registrada: ${description} - R$ ${amount.toFixed(2)} (${type === 'income' ? 'Receita' : 'Despesa'})`);
        
        // Fechar menu mobile se estiver aberto
        if (window.innerWidth <= 1024 && sidebar.classList.contains('active')) {
            closeMobileMenu();
        }
        
        // Ocultar painel de contas rápido após transação
        hideQuickAccounts();
        
        // Resetar paginação de transações
        resetTransactionPagination();
        
    } catch (error) {
        alert('Erro ao adicionar transação: ' + error.message);
    }
}

// Função para enviar mensagem no chat
async function handleSendChat() {
    const message = chatInput.value.trim();
    
    if (!message) return;
    
    // Adicionar mensagem do usuário
    addChatMessage(message, true);
    
    // Limpar input
    chatInput.value = '';
    
    // Verificar se há uma ação pendente que precisa de resposta
    if (pendingChatAction) {
        // Verificar se o usuário quer cancelar a ação pendente
        if (isCancellationMessage(message)) {
            addChatMessage("Tá então, vamos fazer outra coisa! 😊");
            pendingChatAction = null;
            conversationContext.pendingQuestion = null;
            return;
        }
        
        const wasProcessed = await handlePendingActionInput(message);
        if (wasProcessed) {
            return; // A mensagem foi processada como resposta à ação pendente
        }
    }
    
    try {
        // Processar a mensagem com o processador de linguagem natural avançado
        const result = await processChatMessageAdvanced(message, accounts, conversationContext, transactions, fixedBills);
        
        // Tratar o resultado baseado no status
        switch (result.status) {
            case 'success':
                // Executar a ação correspondente
                await executeChatAction(result);
                // Mostrar resposta de sucesso
                addChatMessage(result.response);
                // Atualizar contexto da conversa
                updateConversationContext(result.action, result.pendingQuestion);
                // Limpar pergunta pendente se a ação foi executada
                if (result.status === 'success') {
                    conversationContext.pendingQuestion = null;
                }
                break;
                
            case 'confirmation':
                // Mostrar pergunta de confirmação
                addChatMessage(result.response);
                // Mostrar botões de confirmação
                showConfirmationButtons(result.pendingAction);
                break;
                
            case 'clarification':
                // Mostrar pergunta de esclarecimento
                addChatMessage(result.response);
                
                // Se há opções, mostrar botões para o usuário escolher
                if (result.options && result.options.length > 0) {
                    showChatOptions(result.options, result.pendingAction);
                }
                
                // Salvar pergunta pendente no contexto
                if (result.pendingQuestion) {
                    conversationContext.pendingQuestion = result.pendingQuestion;
                }
                
                // Salvar ação pendente para processar a resposta
                pendingChatAction = result.pendingAction;
                break;
                
            case 'error':
                // Mostrar mensagem de erro
                addChatMessage(result.response);
                break;
                
            default:
                addChatMessage("Desculpe, não consegui processar sua mensagem.");
        }
        
    } catch (error) {
        console.error('Erro ao processar mensagem do chat:', error);
        addChatMessage("Ocorreu um erro ao processar sua mensagem. Tente novamente.");
    }
}

// Função para atualizar o contexto da conversa
function updateConversationContext(action, pendingQuestion = null) {
    if (action && action !== 'show_balance' && action !== 'show_total_balance' && action !== 'show_help') {
        conversationContext.lastIntent = action;
    }
    if (pendingQuestion) {
        conversationContext.pendingQuestion = pendingQuestion;
    }
}

// Função para mostrar botões de confirmação
function showConfirmationButtons(pendingAction) {
    const confirmationContainer = document.createElement('div');
    confirmationContainer.className = 'mt-3 space-y-2';
    confirmationContainer.id = 'confirmation-buttons';
    
    const confirmButton = document.createElement('button');
    confirmButton.className = 'w-full px-3 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm text-white font-medium transition-colors';
    confirmButton.textContent = 'Sim, confirmar';
    
    const cancelButton = document.createElement('button');
    cancelButton.className = 'w-full px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm text-white font-medium transition-colors';
    cancelButton.textContent = 'Não, cancelar';
    
    confirmButton.addEventListener('click', async () => {
        try {
            // Executar a ação confirmada
            await executeChatAction({
                status: 'success',
                action: getActionFromPendingAction(pendingAction),
                data: pendingAction,
                response: getConfirmationResponse(pendingAction)
            });
            
            // Mostrar resposta de sucesso
            addChatMessage(getConfirmationResponse(pendingAction));
            
            // Atualizar contexto da conversa
            updateConversationContext(getActionFromPendingAction(pendingAction));
            
        } catch (error) {
            console.error('Erro ao executar ação confirmada:', error);
            addChatMessage("Erro ao executar a ação. Tente novamente.");
        }
        
        // Remover botões de confirmação
        confirmationContainer.remove();
    });
    
    cancelButton.addEventListener('click', () => {
        addChatMessage("❌ Ação cancelada pelo usuário.");
        confirmationContainer.remove();
    });
    
    confirmationContainer.appendChild(confirmButton);
    confirmationContainer.appendChild(cancelButton);
    
    // Adicionar os botões ao chat
    const chatMessages = document.getElementById('chat-messages');
    chatMessages.appendChild(confirmationContainer);
    
    // Scroll para o final
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Função para obter a ação a partir da ação pendente
function getActionFromPendingAction(pendingAction) {
    switch (pendingAction.type) {
        case 'add_expense':
        case 'add_income':
            return 'add_transaction';
        case 'perform_transfer':
            return 'perform_transfer';
        default:
            return pendingAction.type;
    }
}

// Função para obter a resposta de confirmação
function getConfirmationResponse(pendingAction) {
    switch (pendingAction.type) {
        case 'add_expense':
            return `✅ Despesa confirmada: ${pendingAction.description || 'Despesa'} - R$ ${(pendingAction.amount || 0).toFixed(2)}`;
        case 'add_income':
            return `✅ Receita confirmada: ${pendingAction.description || 'Receita'} - R$ ${(pendingAction.amount || 0).toFixed(2)}`;
        case 'perform_transfer':
            const fromAccount = accounts.find(acc => acc.id === pendingAction.fromAccountId);
            const toAccount = accounts.find(acc => acc.id === pendingAction.toAccountId);
            return `✅ Transferência confirmada: R$ ${(pendingAction.amount || 0).toFixed(2)} de ${fromAccount?.name || 'conta origem'} para ${toAccount?.name || 'conta destino'}`;
        default:
            return "✅ Ação confirmada com sucesso!";
    }
}

// Função para executar ações do chat
async function executeChatAction(result) {
    try {
        switch (result.action) {
            case 'add_transaction':
                // Adicionar transação
                console.log(`🔍 Executando ação add_transaction com dados:`, result.data);
                const transactionResult = await addTransaction(result.data);
                console.log(`✅ Transação criada com ID: ${transactionResult.id}`);
                
                // Armazenar última transação para correção
                lastTransaction = {
                    id: transactionResult.id,
                    ...result.data,
                    createdAt: new Date()
                };
                
                // Atualizar saldo da conta usando a validação retornada
                if (transactionResult.validation && transactionResult.validation.isValid) {
                    console.log(`🔍 Atualizando saldo usando validação: ${transactionResult.validation.accountName} - Novo saldo: R$ ${transactionResult.validation.newBalance.toFixed(2)}`);
                    await updateAccountBalance(result.data.accountId, transactionResult.validation.newBalance);
                    console.log(`✅ Saldo da conta atualizado com validação`);
                } else {
                    // Fallback para o método anterior (caso não tenha validação)
                    const account = accounts.find(acc => acc.id === result.data.accountId);
                    console.log(`🔍 Conta encontrada:`, account);
                    if (account) {
                        let newBalance = account.balance;
                        if (result.data.type === 'income') {
                            newBalance += result.data.amount;
                        } else {
                            newBalance -= result.data.amount;
                        }
                        console.log(`🔍 Novo saldo calculado: R$ ${newBalance} (saldo anterior: R$ ${account.balance}, ${result.data.type === 'income' ? '+' : '-'} R$ ${result.data.amount})`);
                        await updateAccountBalance(result.data.accountId, newBalance);
                        console.log(`✅ Saldo da conta atualizado`);
                    } else {
                        console.log(`❌ Conta não encontrada para ID: ${result.data.accountId}`);
                    }
                }
                break;
                
            case 'perform_transfer':
                // Realizar transferência entre contas
                await performTransfer(result.data.fromAccountId, result.data.toAccountId, result.data.amount);
                
                // Armazenar última transação para correção
                lastTransaction = {
                    type: 'transfer',
                    fromAccountId: result.data.fromAccountId,
                    toAccountId: result.data.toAccountId,
                    amount: result.data.amount,
                    createdAt: new Date()
                };
                break;
                
            case 'create_account':
                // Criar nova conta
                await addAccount(result.data.accountName, result.data.initialBalance);
                break;
                
            case 'add_recurring_bill':
                // Adicionar conta recorrente
                await addRecurringBill(result.data);
                break;
                
            case 'create_fixed_bill':
                // Criar conta fixa mensal
                console.log(`🔍 Executando ação create_fixed_bill com dados:`, result.data);
                const fixedBillResult = await addRecurringBill(result.data);
                console.log(`✅ Conta fixa criada com ID: ${fixedBillResult.id}`);
                
                // Atualizar lista de contas fixas na interface
                await updateFixedBillsList();
                break;
                
            case 'mark_bill_as_paid':
                // Marcar conta recorrente como paga (criar transação)
                // Usar os dados já extraídos da mensagem
                if (result.data.billId && result.data.amount && result.data.accountId) {
                    try {
                        // Validar saldo antes de criar a transação
                        const paymentAccount = accounts.find(acc => acc.id === result.data.accountId);
                        if (!paymentAccount) {
                            addChatMessage("❌ Conta não encontrada para processar o pagamento.");
                            break;
                        }
                        
                        const currentBalance = paymentAccount.balance || 0;
                        if (currentBalance < result.data.amount) {
                            addChatMessage(`❌ Saldo insuficiente! A conta "${paymentAccount.name}" tem apenas R$ ${currentBalance.toFixed(2)} disponível. Você precisa de R$ ${result.data.amount.toFixed(2)} para pagar ${result.data.billName}.\n\n💡 **Sugestões:**\n• Adicione dinheiro à conta primeiro\n• Use uma conta com saldo suficiente\n• Reduza o valor da conta fixa`);
                            break;
                        }
                        
                        // Saldo suficiente, criar a transação
                        const transactionId = await addTransaction({
                            description: `Pagamento de ${result.data.billName}`,
                            amount: result.data.amount,
                            type: 'expense',
                            accountId: result.data.accountId
                        });
                        
                        // Armazenar última transação para correção
                        lastTransaction = {
                            id: transactionId,
                            description: `Pagamento de ${result.data.billName}`,
                            amount: result.data.amount,
                            type: 'expense',
                            accountId: result.data.accountId,
                            createdAt: new Date()
                        };
                        
                        // O saldo já foi atualizado pelo addTransaction com validação
                        addChatMessage(`✅ Pagamento de ${result.data.billName} (R$ ${result.data.amount.toFixed(2)}) registrado na conta ${paymentAccount.name}!`);
                        
                    } catch (error) {
                        console.error('Erro ao processar pagamento:', error);
                        addChatMessage(`❌ Erro ao processar pagamento: ${error.message}`);
                    }
                } else {
                    console.error('Dados incompletos para marcar conta como paga:', result.data);
                    addChatMessage("❌ Erro interno: dados incompletos para processar o pagamento.");
                }
                break;
                
            case 'fixed_bill_payment':
                // Processar pagamento de conta fixa
                console.log('💰 Executando ação fixed_bill_payment com dados:', result.data);
                console.log('🔍 result.requiresAccountSelection:', result.requiresAccountSelection);
                console.log('🔍 result.data.bank:', result.data.bank);
                console.log('🔍 !result.requiresAccountSelection:', !result.requiresAccountSelection);
                
                // Se não requer seleção de conta, processar diretamente
                if (!result.requiresAccountSelection) {
                    // Processar pagamento com banco já especificado
                    if (result.data.bank && result.data.bill) {
                        const bankAccount = accounts.find(acc => 
                            acc.name.toLowerCase().includes(result.data.bank.name.toLowerCase()) ||
                            acc.name.toLowerCase() === result.data.bank.name.toLowerCase()
                        );
                        
                        if (bankAccount) {
                            // 🔧 CORREÇÃO: Usar valor real da conta fixa se disponível
                            const amount = result.data.realAmount || result.data.amount || result.data.bill.amount || 0;
                            
                            // VALIDAÇÃO CRÍTICA: Impedir valores inválidos ou zero
                            if (!amount || amount <= 0) {
                                addChatMessage(`❌ Erro: Valor da conta fixa "${result.data.bill.name}" não foi definido corretamente. Valor detectado: R$ ${amount.toFixed(2)}.\n\n💡 **Para corrigir:**\n• Verifique se a conta fixa foi cadastrada com valor correto\n• Use o painel de contas fixas para definir o valor\n• Tente: "paguei R$ 100 do aluguel"`);
                                break;
                            }
                            
                            // Validar saldo antes de criar a transação
                            const currentBalance = bankAccount.balance || 0;
                            if (currentBalance < amount) {
                                addChatMessage(`❌ Saldo insuficiente! A conta "${bankAccount.name}" tem apenas R$ ${currentBalance.toFixed(2)} disponível. Você precisa de R$ ${amount.toFixed(2)} para pagar ${result.data.bill.name}.\n\n💡 **Sugestões:**\n• Adicione dinheiro à conta primeiro\n• Use uma conta com saldo suficiente\n• Reduza o valor da conta fixa`);
                                break;
                            }
                            
                            try {
                                const transactionId = await addTransaction({
                                    description: `Pagamento de ${result.data.bill.name}`,
                                    amount: amount,
                                    type: 'expense',
                                    accountId: bankAccount.id
                                });
                                
                                // Armazenar última transação para correção
                                lastTransaction = {
                                    id: transactionId,
                                    description: `Pagamento de ${result.data.bill.name}`,
                                    amount: amount,
                                    type: 'expense',
                                    accountId: bankAccount.id,
                                    createdAt: new Date()
                                };
                                
                                // O saldo já foi atualizado pelo addTransaction com validação
                                addChatMessage(`✅ Pagamento de ${result.data.bill.name} (R$ ${amount.toFixed(2)}) registrado na conta ${bankAccount.name}!`);
                            } catch (error) {
                                console.error('Erro ao processar pagamento:', error);
                                addChatMessage(`❌ Erro ao processar pagamento: ${error.message}`);
                            }
                        } else {
                            addChatMessage(`❌ Não consegui encontrar a conta ${result.data.bank.name}. Verifique se ela está cadastrada.`);
                        }
                    }
                } else {
                    // Requer seleção de conta - verificar valor antes de mostrar opções
                    // 🔧 CORREÇÃO: Usar valor real da conta fixa se disponível
                    const billAmount = result.data.realAmount || result.data.amount || result.data.bill.amount || 0;
                    
                    // VALIDAÇÃO CRÍTICA: Impedir valores inválidos ou zero
                    if (!billAmount || billAmount <= 0) {
                        addChatMessage(`❌ Erro: Valor da conta fixa "${result.data.bill.name}" não foi definido corretamente. Valor detectado: R$ ${billAmount.toFixed(2)}.\n\n💡 **Para corrigir:**\n• Verifique se a conta fixa foi cadastrada com valor correto\n• Use o painel de contas fixas para definir o valor\n• Tente: "paguei R$ 100 do aluguel"`);
                        break;
                    }
                    
                    // Mostrar apenas contas com saldo suficiente
                    const validAccounts = accounts.filter(acc => acc.balance >= billAmount);
                    
                    if (validAccounts.length === 0) {
                        addChatMessage(`❌ Nenhuma conta tem saldo suficiente para pagar ${result.data.bill.name} (R$ ${billAmount.toFixed(2)}).\n\n💡 **Sugestões:**\n• Adicione dinheiro a uma das suas contas\n• Reduza o valor da conta fixa\n• Use uma transferência de outra conta primeiro\n\n💰 **Seus saldos atuais:**\n${accounts.map(acc => `• ${acc.name}: R$ ${acc.balance.toFixed(2)}`).join('\n')}`);
                        break;
                    }
                    
                    // Requer seleção de conta - mostrar apenas opções válidas
                    const accountOptions = validAccounts.map(acc => ({
                        name: `${acc.name} - Saldo: R$ ${acc.balance.toFixed(2)} ✅`,
                        id: acc.id,
                        accountData: acc
                    }));
                    
                    // Armazenar ação pendente para processar a seleção
                    pendingChatAction = {
                        type: 'fixed_bill_payment_selection',
                        billData: result.data.bill,
                        amount: result.data.amount,
                        originalMessage: result.data.originalMessage
                    };
                    
                    // Mostrar opções de contas
                    showChatOptions(accountOptions, pendingChatAction);
                }
                break;
                
            case 'cancel_last_transaction':
                // Cancelar última transação
                if (lastTransaction) {
                    await reverseTransaction(lastTransaction);
                    addChatMessage(`✅ Transação cancelada: ${lastTransaction.description || 'Transação'} - R$ ${lastTransaction.amount.toFixed(2)}`);
                    lastTransaction = null;
                } else {
                    addChatMessage("❌ Nenhuma transação encontrada para cancelar.");
                }
                break;
                
            case 'pix_query':
                // Consulta de pix por pessoa
                console.log(`🔍 Executando consulta de pix com dados:`, result.data);
                // A resposta já foi processada em processPixQueryIntent
                break;
                
            case 'get_summary':
                // Buscar transações do período especificado
                const transactions = await getTransactionsByDateRange(result.data.startDate, result.data.endDate);
                
                // 🚀 NOVO: Verificar se deve usar resumo inteligente
                if (result.data.useIntelligentSummary && fixedBills && fixedBills.length > 0) {
                    // Usar resumo inteligente com contas fixas
                    try {
                        const intelligentSummary = await generateIntelligentFinancialSummary(
                            transactions, 
                            fixedBills, 
                            accounts, 
                            result.data.period, 
                            result.data.startDate, 
                            result.data.endDate
                        );
                        addChatMessage(intelligentSummary);
                    } catch (error) {
                        console.error('Erro ao gerar resumo inteligente:', error);
                        // Fallback para resumo básico
                        generateBasicSummary();
                    }
                } else {
                    // Resumo básico (comportamento anterior)
                    generateBasicSummary();
                }
                
                // Função auxiliar para resumo básico
                async function generateBasicSummary() {
                    let summary = '';
                    if (transactions.length === 0) {
                        summary = `No período ${result.data.period}, não encontrei nenhuma transação.`;
                    } else {
                        let totalIncome = 0;
                        let totalExpenses = 0;
                        const expensesByCategory = {};

                        // Map de nomes de contas para evitar que apareçam como "descrição"
                        const accountNamesLower = new Set(
                            (accounts || [])
                                .filter(acc => acc && acc.name)
                                .map(acc => acc.name.toLowerCase())
                        );
                        
                        transactions.forEach(transaction => {
                            if (transaction.type === 'income') {
                                totalIncome += transaction.amount || 0;
                            } else if (transaction.type === 'expense') {
                                totalExpenses += transaction.amount || 0;
                                
                                // Agrupar despesas por descrição; se a descrição for igual ao nome de uma conta, considerar como "Sem descrição"
                                let category = (transaction.description || 'Sem descrição').trim();
                                if (accountNamesLower.has(category.toLowerCase())) {
                                    category = 'Sem descrição';
                                }
                                if (!expensesByCategory[category]) {
                                    expensesByCategory[category] = 0;
                                }
                                expensesByCategory[category] += (transaction.amount || 0);
                            }
                        });
                        
                        // Ordenar despesas por valor (maiores primeiro)
                        const sortedExpenses = Object.entries(expensesByCategory)
                            .sort(([,a], [,b]) => b - a)
                            .slice(0, 3); // Top 3 despesas
                        
                        summary = `📊 **Resumo do período ${result.data.period}:**\n\n`;
                        summary += `💰 **Receitas:** R$ ${totalIncome.toFixed(2)}\n`;
                        summary += `💸 **Despesas:** R$ ${totalExpenses.toFixed(2)}\n`;
                        summary += `💵 **Saldo do período:** R$ ${(totalIncome - totalExpenses).toFixed(2)}\n`;
                        
                        if (sortedExpenses.length > 0) {
                            summary += `\n🔍 **Principais despesas:**\n`;
                            sortedExpenses.forEach(([category, amount]) => {
                                summary += `• ${category}: R$ ${amount.toFixed(2)}\n`;
                            });
                        }

                        // Mostrar também o saldo total das contas para contexto
                        try {
                            const stats = await getFinancialStats();
                            summary += `\n🏦 **Saldo total das contas:** R$ ${stats.totalBalance.toFixed(2)}`;
                        } catch (_) { /* ignora erro de stats no resumo do chat */ }
                    }
                    
                    // Mostrar o resumo no chat
                    addChatMessage(summary);
                }
                break;
                
            case 'get_expense_query':
                // Buscar gastos específicos do período
                const expenseTransactions = await getTransactionsByDateRange(result.data.startDate, result.data.endDate);
                const expenses = expenseTransactions.filter(t => t.type === 'expense');
                
                if (expenses.length === 0) {
                    addChatMessage(`💸 Você não gastou nada ${result.data.period}.`);
                } else {
                    const totalExpenses = expenses.reduce((sum, t) => sum + (t.amount || 0), 0);
                    let response = `💸 ${result.data.period.charAt(0).toUpperCase() + result.data.period.slice(1)}, você gastou R$ ${totalExpenses.toFixed(2)}:\n\n`;
                    
                    expenses.forEach(expense => {
                        const time = expense.createdAt ? new Date(expense.createdAt.toDate()).toLocaleTimeString('pt-BR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                        }) : 'horário não registrado';
                        response += `• ${expense.description || 'Sem descrição'} - R$ ${expense.amount.toFixed(2)} (${time})\n`;
                    });
                    
                    addChatMessage(response);
                }
                break;
                
            case 'get_income_query':
                // Buscar receitas específicas do período
                const incomeTransactions = await getTransactionsByDateRange(result.data.startDate, result.data.endDate);
                const incomes = incomeTransactions.filter(t => t.type === 'income');
                
                if (incomes.length === 0) {
                    addChatMessage(`💰 Você não recebeu nada ${result.data.period}.`);
                } else {
                    const totalIncome = incomes.reduce((sum, t) => sum + (t.amount || 0), 0);
                    let response = `💰 ${result.data.period.charAt(0).toUpperCase() + result.data.period.slice(1)}, você recebeu R$ ${totalIncome.toFixed(2)}:\n\n`;
                    
                    incomes.forEach(income => {
                        const time = income.createdAt ? new Date(income.createdAt.toDate()).toLocaleTimeString('pt-BR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                        }) : 'horário não registrado';
                        response += `• ${income.description || 'Sem descrição'} - R$ ${income.amount.toFixed(2)} (${time})\n`;
                    });
                    
                    addChatMessage(response);
                }
                break;
                
            case 'show_balance':
            case 'show_total_balance':
                // Apenas mostrar informações - não precisa executar ação
                break;
                
            case 'show_help':
                // Apenas mostrar ajuda - não precisa executar ação
                break;
                
            default:
                console.log('Ação não implementada:', result.action);
        }
        
        // Atualizar estatísticas
        updateFinancialStats();
        
    } catch (error) {
        console.error('Erro ao executar ação do chat:', error);
        addChatMessage("Erro ao executar a ação. Tente novamente.");
    }
}

// Função para mostrar opções de escolha no chat
function showChatOptions(options, pendingAction) {
    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'mt-3 space-y-2';
    
    options.forEach(option => {
        const button = document.createElement('button');
        button.className = 'w-2/3 mx-auto text-left px-3 py-2 bg-white/90 hover:bg-blue-50 border border-blue-200 rounded-lg text-sm text-gray-800 font-medium shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden shine-effect';
        button.textContent = option.name;
        
        button.addEventListener('click', async () => {
            // Processar a resposta de esclarecimento
            const result = await processClarificationResponse(option.id, pendingAction, accounts, fixedBills);
            
            if (result.status === 'success') {
                // Executar a ação
                await executeChatAction(result);
                // Mostrar resposta de sucesso
                addChatMessage(result.response);
            } else {
                // Mostrar erro
                addChatMessage(result.response);
            }
            
            // Limpar ação pendente
            pendingChatAction = null;
            
            // Remover os botões de opção
            optionsContainer.remove();
        });
        
        optionsContainer.appendChild(button);
    });
    
    // Adicionar os botões ao chat
    const chatMessages = document.getElementById('chat-messages');
    chatMessages.appendChild(optionsContainer);
    
    // Scroll para o final
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Função para processar entrada de texto para ações pendentes
async function handlePendingActionInput(input) {
    if (!pendingChatAction) return false;
    
    // Processar a resposta baseada no tipo de ação pendente
    if (pendingChatAction.type === 'create_account') {
        // Para criação de conta, o input deve ser o saldo inicial
        const initialBalance = parseFloat(input);
        if (isNaN(initialBalance) || initialBalance < 0) {
            addChatMessage("Por favor, informe um valor válido para o saldo inicial.");
            return true; // Indica que a mensagem foi processada
        }
        
        // Processar criação da conta
        const result = await processClarificationResponse(initialBalance, pendingChatAction, accounts, fixedBills);
        if (result.status === 'success') {
            await executeChatAction(result);
            addChatMessage(result.response);
            updateConversationContext(result.action);
            // Limpar pergunta pendente
            conversationContext.pendingQuestion = null;
        } else {
            addChatMessage(result.response);
        }
        pendingChatAction = null;
        
        return true; // Indica que a mensagem foi processada
    }
    
    // Para ações de resumo que precisam de esclarecimento
    if (pendingChatAction.type === 'clarify_month_for_summary' || 
        pendingChatAction.type === 'specify_month_for_summary') {
        
        // Processar resposta de esclarecimento para resumo
        const result = await processClarificationResponse(input, pendingChatAction, accounts, fixedBills);
        if (result.status === 'success') {
            await executeChatAction(result);
            updateConversationContext(result.action);
            // Limpar pergunta pendente
            conversationContext.pendingQuestion = null;
            // A resposta já foi mostrada na função executeChatAction
        } else {
            addChatMessage(result.response);
        }
        pendingChatAction = null;
        
        return true; // Indica que a mensagem foi processada
    }
    
    // Para correções de transação
    if (pendingChatAction.type === 'correct_transaction_value' ||
        pendingChatAction.type === 'correct_transaction_description') {
        
        if (!lastTransaction) {
            addChatMessage("❌ Nenhuma transação encontrada para corrigir.");
            pendingChatAction = null;
            return true;
        }
        
        // Processar correção
        handleTransactionCorrection(pendingChatAction.type, input);
        return true;
    }
    
    // Para adição de despesa/receita que precisa de conta
    if (pendingChatAction.type === 'add_expense' || pendingChatAction.type === 'add_income') {
        console.log(`🔍 Processando resposta para ${pendingChatAction.type}:`, input);
        console.log(`🔍 Contas disponíveis:`, accounts);
        console.log(`🔍 pendingChatAction:`, pendingChatAction);
        
        // Sempre delegar para processClarificationResponse para despesas/receitas
        // Esta função já sabe como interpretar o input baseado no estado atual
        const result = await processClarificationResponse(input, pendingChatAction, accounts, fixedBills);
        console.log(`🔍 Resultado do processClarificationResponse:`, result);
        
        if (result.status === 'success') {
            console.log(`🔍 Executando ação:`, result.action);
            await executeChatAction(result);
            addChatMessage(result.response);
            updateConversationContext(result.action);
            // Limpar pergunta pendente
            conversationContext.pendingQuestion = null;
            pendingChatAction = null;
        } else if (result.status === 'clarification') {
            // Se ainda precisa de mais informações, atualizar a ação pendente
            addChatMessage(result.response);
            pendingChatAction = result.pendingAction;
            
            // Se há opções, mostrar botões para o usuário escolher
            if (result.options && result.options.length > 0) {
                showChatOptions(result.options, result.pendingAction);
            }
        } else {
            addChatMessage(result.response);
            pendingChatAction = null;
        }
        
        return true; // Indica que a mensagem foi processada
    }
    
    // Para correção de conta
    if (pendingChatAction.type === 'correct_transaction_account') {
        if (!lastTransaction) {
            addChatMessage("❌ Nenhuma transação encontrada para corrigir.");
            pendingChatAction = null;
            return true;
        }
        
        // Processar correção de conta
        handleTransactionCorrection('account', input);
        return true;
    }
    
    return false; // Indica que a mensagem não foi processada
}

// Função para lidar com correções de transação
async function handleTransactionCorrection(correctionType, newValue) {
    try {
        if (!lastTransaction) {
            addChatMessage("❌ Nenhuma transação encontrada para corrigir.");
            pendingChatAction = null;
            return;
        }
        
        let updateData = {};
        
        switch (correctionType) {
            case 'correct_transaction_value':
                const newAmount = parseFloat(newValue);
                if (isNaN(newAmount) || newAmount <= 0) {
                    addChatMessage("❌ Valor inválido. Por favor, informe um número válido.");
                    return;
                }
                updateData.amount = newAmount;
                break;
                
            case 'correct_transaction_description':
                if (!newValue.trim()) {
                    addChatMessage("❌ Descrição não pode estar vazia.");
                    return;
                }
                updateData.description = newValue.trim();
                break;
                
            case 'account':
                const account = accounts.find(acc => acc.id === newValue);
                if (!account) {
                    addChatMessage("❌ Conta não encontrada.");
                    return;
                }
                updateData.accountId = newValue;
                break;
        }
        
        // Se é uma transação com ID (não transferência), atualizar
        if (lastTransaction.id) {
            await updateTransaction(lastTransaction.id, updateData);
            addChatMessage("✅ Transação corrigida com sucesso!");
        } else {
            // Para transferências, desfazer e refazer
            await reverseTransaction(lastTransaction);
            await performTransfer(
                updateData.fromAccountId || lastTransaction.fromAccountId,
                updateData.toAccountId || lastTransaction.toAccountId,
                updateData.amount || lastTransaction.amount
            );
            addChatMessage("✅ Transferência corrigida com sucesso!");
        }
        
        // Limpar ação pendente
        pendingChatAction = null;
        
        // Limpar pergunta pendente
        conversationContext.pendingQuestion = null;
        
        // Atualizar estatísticas
        updateFinancialStats();
        
    } catch (error) {
        console.error('Erro ao corrigir transação:', error);
        addChatMessage("❌ Erro ao corrigir a transação. Tente novamente.");
    }
}

// Função para limpar dados de teste
async function handleClearTestData() {
    showSecurityModal('clear-data');
}

// Função para mostrar modal de segurança
function showSecurityModal(action) {
    const modal = document.getElementById('security-modal');
    const securityCode = document.getElementById('security-code');
    const securityCodeInput = document.getElementById('security-code-input');
    const confirmBtn = document.getElementById('confirm-security-btn');
    
    // Gerar código aleatório de 6 dígitos
    const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
    securityCode.textContent = randomCode;
    
    // Limpar input e habilitar/desabilitar botão
    securityCodeInput.value = '';
    confirmBtn.disabled = true;
    
    // Mostrar modal
    modal.classList.remove('hidden');
    
    // Event listeners para o modal
    const cancelBtn = document.getElementById('cancel-security-btn');
    
    // Função para verificar código
    const checkCode = () => {
        if (securityCodeInput.value === randomCode) {
            confirmBtn.disabled = false;
        } else {
            confirmBtn.disabled = true;
        }
    };
    
    // Input listener
    securityCodeInput.addEventListener('input', checkCode);
    
    // Botão cancelar
    cancelBtn.onclick = () => {
        modal.classList.add('hidden');
        securityCodeInput.removeEventListener('input', checkCode);
    };
    
    // Botão confirmar
    confirmBtn.onclick = async () => {
        if (action === 'clear-data') {
            try {
                await clearTestData();
                addChatMessage('✅ Dados de teste limpos com sucesso!');
                // Limpar contexto da conversa
                conversationContext = { lastIntent: null, pendingQuestion: null };
                // Reiniciar a aplicação para refletir as mudanças
                window.location.reload();
            } catch (error) {
                console.error('Erro ao limpar dados de teste:', error);
                addChatMessage('❌ Erro ao limpar dados de teste. Tente novamente.');
            }
        }
        
        modal.classList.add('hidden');
        securityCodeInput.removeEventListener('input', checkCode);
    };
}

// Função para mostrar modal de gerenciamento de contas
function showManageAccountsModal() {
    const modal = document.getElementById('manage-accounts-modal');
    const accountsListContainer = document.getElementById('accounts-list-container');
    
    // Renderizar lista de contas
    renderAccountsList(accountsListContainer);
    
    // Mostrar modal
    modal.classList.remove('hidden');
    
    // Event listener para fechar modal
    const closeBtn = document.getElementById('close-manage-accounts-btn');
    closeBtn.onclick = () => {
        modal.classList.add('hidden');
    };
}

// Função para renderizar lista de contas no modal
function renderAccountsList(container) {
    if (!accounts || accounts.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8">
                <p class="text-gray-500">Nenhuma conta encontrada</p>
            </div>
        `;
        return;
    }
    
    const accountsHTML = accounts.map(account => `
        <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-3 account-item">
            <div class="flex-1">
                <h4 class="font-semibold text-gray-900">${account.name}</h4>
                <p class="text-sm text-gray-600">Saldo: R$ ${account.balance?.toFixed(2) || '0.00'}</p>
            </div>
            <div class="flex space-x-2">
                <button 
                    data-account-id="${account.id}"
                    data-account-name="${account.name}"
                    class="delete-account-btn bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-1"
                >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                    <span>Remover</span>
                </button>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = accountsHTML;
    
    // Adicionar event listeners para os botões de remoção
    const deleteButtons = container.querySelectorAll('.delete-account-btn');
    deleteButtons.forEach(button => {
        button.addEventListener('click', () => {
            const accountId = button.getAttribute('data-account-id');
            const accountName = button.getAttribute('data-account-name');
            showDeleteAccountModal(accountId, accountName);
        });
    });
}

// Função para mostrar modal de confirmação de remoção de conta
function showDeleteAccountModal(accountId, accountName) {
    const modal = document.getElementById('delete-account-modal');
    const accountToDelete = document.getElementById('account-to-delete');
    
    accountToDelete.textContent = accountName;
    
    // Mostrar modal
    modal.classList.remove('hidden');
    
    // Event listeners
    const cancelBtn = document.getElementById('cancel-delete-account-btn');
    const confirmBtn = document.getElementById('confirm-delete-account-btn');
    
    cancelBtn.onclick = () => {
        modal.classList.add('hidden');
    };
    
    confirmBtn.onclick = async () => {
        try {
            // Tentar remover normalmente primeiro
            await deleteAccount(accountId);
            addChatMessage(`✅ Conta "${accountName}" removida com sucesso!`);
            
            // Fechar modal
            modal.classList.add('hidden');
            
            // Atualizar estatísticas
            updateFinancialStats();
            
            // Fechar modal de gerenciamento de contas também
            document.getElementById('manage-accounts-modal').classList.add('hidden');
            
        } catch (error) {
            console.error('Erro ao remover conta:', error);
            
            // Se o erro for sobre transações, oferecer opção de remoção forçada
            if (error.message.includes('transações')) {
                // Contar quantas transações a conta possui
                let transactionCount = 0;
                try {
                    transactionCount = await countTransactionsByAccount(accountId);
                } catch (countError) {
                    console.error('Erro ao contar transações:', countError);
                }
                
                const forceDelete = confirm(`⚠️ Esta conta possui ${transactionCount} transação(ões) associada(s).\n\nDeseja remover a conta E todas as suas transações?\n\n⚠️ ATENÇÃO: Esta ação não pode ser desfeita!`);
                
                if (forceDelete) {
                    try {
                        await deleteAccount(accountId, true);
                        addChatMessage(`✅ Conta "${accountName}" e todas as suas transações foram removidas com sucesso!`);
                        
                        // Fechar modal
                        modal.classList.add('hidden');
                        
                        // Atualizar estatísticas
                        updateFinancialStats();
                        
                        // Fechar modal de gerenciamento de contas também
                        document.getElementById('manage-accounts-modal').classList.add('hidden');
                        
                    } catch (forceError) {
                        console.error('Erro na remoção forçada:', forceError);
                        addChatMessage(`❌ Erro na remoção forçada: ${forceError.message}`);
                        modal.classList.add('hidden');
                    }
                } else {
                    addChatMessage(`❌ Remoção da conta cancelada pelo usuário.`);
                    modal.classList.add('hidden');
                }
            } else {
                addChatMessage(`❌ Erro ao remover conta: ${error.message}`);
                modal.classList.add('hidden');
            }
        }
    };
}

// Função para inicializar a aplicação
async function initApp() {
    // Verificar índices necessários primeiro
    try {
        await initializeIndexes();
    } catch (error) {
        // Continuar sem mostrar erro
    }
    
    // Configurar listener de estado de autenticação do Firebase
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // Usuário está logado
            currentUser = user;
            isAuthenticated = true;
            showAppScreen();
            
            // Mensagem de boas-vindas no chat
            addChatMessage(`Olá! Bem-vindo ao Dinah, ${user.email.split('@')[0]}! Como posso ajudar com suas finanças hoje?`);
            
            // Limpar contexto da conversa
            conversationContext = { lastIntent: null, pendingQuestion: null };
            
            // Limpar formulário e erros
            loginForm.reset();
            hideAuthError();
            
            // Aguardar um pouco para garantir que a autenticação esteja completa
            setTimeout(async () => {
                console.log('🔍 Configurando listeners do Firestore após delay...');
                
                // Aguardar um pouco mais para garantir que os elementos do DOM estejam prontos
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // Configurar listeners do Firestore
                setupFirestoreListeners();
                
                // Atualizar estatísticas iniciais
                updateFinancialStats();
                
                // Ajustar layout para o tamanho atual da tela
                adjustLayoutForScreenSize();
            }, 1000);
            
            // Usuário logado com sucesso
        } else {
            // Usuário não está logado
            currentUser = null;
            isAuthenticated = false;
            showLoginScreen();
            
            // Limpar chat
            chatMessages.innerHTML = `
                <div class="flex justify-start">
                    <div class="assistant-message rounded-lg px-3 py-2 max-w-xs">
                        <p class="text-sm">Olá! Sou seu assistente financeiro. Como posso ajudar hoje?</p>
                    </div>
                </div>
            `;
            
            // Limpar contexto da conversa
            conversationContext = { lastIntent: null, pendingQuestion: null };
            
            // Limpar listeners do Firestore
            cleanupFirestoreListeners();
            
            // Usuário deslogado
        }
    });
    
    // Event listeners
    loginForm.addEventListener('submit', handleLogin);
    signupBtn.addEventListener('click', handleSignup);
    logoutBtn.addEventListener('click', handleLogout);
    sendChatBtn.addEventListener('click', handleSendChat);
    
    // Event listeners para o modal de ajuda
    if (helpBtn) {
        helpBtn.addEventListener('click', () => {
            helpModal.classList.remove('hidden');
            document.body.style.overflow = 'hidden'; // Prevenir scroll do body
        });
    }
    

    
    // Event listeners para o menu mobile
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    }
    
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', handleSidebarOverlayClick);
    }
    
    // Inicializar sistema de abas e painel de contas
    initTabSystem();
    initQuickAccountsPanel();
    initFixedBillsPanel();
    
    // Configurar listeners para indicadores de rolagem
    setupScrollIndicatorListeners();
    
                // Tema escuro aplicado automaticamente via CSS
    
    if (closeHelpModal) {
        closeHelpModal.addEventListener('click', () => {
            helpModal.classList.add('hidden');
            document.body.style.overflow = 'auto'; // Restaurar scroll do body
        });
    }
    

    
    // Fechar modal clicando fora dele
    if (helpModal) {
        helpModal.addEventListener('click', (event) => {
            if (event.target === helpModal) {
                helpModal.classList.add('hidden');
                document.body.style.overflow = 'auto';
            }
        });
    }
    

    
    // Fechar modal com tecla Escape
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !helpModal.classList.contains('hidden')) {
            helpModal.classList.add('hidden');
            document.body.style.overflow = 'auto';
        }

    });
    
    // Event listener para formulário de transações
    if (transactionForm) {
        transactionForm.addEventListener('submit', handleAddTransaction);
    }
    

    
    // Permitir envio com Enter no chat (Shift+Enter para nova linha)
    chatInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSendChat();
        }
    });
    
    // Ajustar altura do textarea automaticamente
    chatInput.addEventListener('input', () => {
        // Resetar altura para calcular corretamente
        chatInput.style.height = 'auto';
        
        // Calcular nova altura baseada no conteúdo
        const scrollHeight = chatInput.scrollHeight;
        const minHeight = 60; // altura mínima em pixels
        const maxHeight = 200; // altura máxima em pixels
        
        // Aplicar altura calculada respeitando os limites
        const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);
        chatInput.style.height = newHeight + 'px';
    });
    
    // Menu mobile configurado com sucesso
    
    // FinChat inicializado com sucesso
}

// Função para configurar listeners do Firestore
function setupFirestoreListeners() {
    console.log('🔍 setupFirestoreListeners chamado');
    console.log('🔍 Usuário atual:', currentUser);
    console.log('🔍 isAuthenticated:', isAuthenticated);
    
    // Listener para contas
    unsubscribeAccounts = onAccountsUpdate((accountsList) => {
        console.log('🔍 Callback de contas recebido:', accountsList);
        accounts = accountsList;
        renderAccounts(accounts);
        updateTransactionAccountSelect();
        renderQuickAccounts(accounts); // Atualizar painel rápido
    });
    
    // Aguardar um pouco para garantir que os elementos estejam prontos antes de carregar contas fixas
    setTimeout(() => {
        console.log('🔄 Carregando contas fixas iniciais...');
        updateFixedBillsList();
    }, 200);
    
    // Listener para transações (limitado para performance)
    unsubscribeTransactions = onTransactionsUpdate((transactionsList) => {
        console.log('🔍 Callback de transações recebido:', transactionsList);
        
        // Limitar transações iniciais para performance
        const initialTransactions = transactionsList.slice(0, transactionLimit);
        transactions = initialTransactions;
        
        // Verificar se há mais transações
        hasMoreTransactions = transactionsList.length > transactionLimit;
        
        // Resetar paginação
        transactionPage = 0;
        
        renderTransactions(transactions);
        updateFinancialStats();
    });
}

// Função para limpar listeners do Firestore
function cleanupFirestoreListeners() {
    if (unsubscribeAccounts) {
        unsubscribeAccounts();
        unsubscribeAccounts = null;
    }
    if (unsubscribeTransactions) {
        unsubscribeTransactions();
        unsubscribeTransactions = null;
    }
}

// Função para atualizar o select de contas no formulário de transações
function updateTransactionAccountSelect() {
    if (transactionAccount) {
        transactionAccount.innerHTML = '<option value="">Selecione uma conta</option>';
        accounts.forEach(account => {
            const option = document.createElement('option');
            option.value = account.id;
            option.textContent = account.name;
            transactionAccount.appendChild(option);
        });
    }
}

// Função para atualizar a lista de contas fixas na interface
async function updateFixedBillsList() {
    try {
        // Verificar se os elementos do DOM estão disponíveis
        if (!fixedBillsList) {
            console.warn('⚠️ Elemento fixedBillsList não está disponível ainda');
            return;
        }
        
        const recurringBills = await getRecurringBills();
        fixedBills = recurringBills;
        
        console.log(`📋 Contas fixas encontradas: ${recurringBills.length}`, recurringBills);
        
        if (recurringBills.length === 0) {
            fixedBillsList.innerHTML = '';
        } else {
            fixedBillsList.innerHTML = recurringBills.map(bill => `
                <div class="bg-white/80 p-3 rounded-lg border border-purple-200 flex items-center justify-between">
                    <div class="flex-1">
                        <div class="flex items-center space-x-2 mb-1">
                            <span class="text-purple-600 text-sm font-medium">${bill.name}</span>
                            <span class="text-xs text-white px-2 py-1 rounded-full ${getCategoryBadgeClass(bill.category || 'other')}">${getCategoryDisplayName(bill.category || 'other')}</span>
                        </div>
                        <div class="flex items-center space-x-4 text-xs text-purple-600">
                            <span>R$ ${bill.amount.toFixed(2)}</span>
                            <span>Dia ${bill.dueDay || 'N/A'}</span>
                            <span class="text-purple-500">${bill.isActive ? '✅ Ativa' : '❌ Inativa'}</span>
                        </div>
                    </div>
                    <div class="flex space-x-1">
                        <button 
                            onclick="toggleFixedBillStatus('${bill.id}')"
                            class="text-purple-600 hover:text-purple-800 p-1 rounded transition-colors duration-200"
                            title="${bill.isActive ? 'Desativar' : 'Ativar'}"
                        >
                            ${bill.isActive ? '⏸️' : '▶️'}
                        </button>
                        <button 
                            onclick="deleteFixedBill('${bill.id}')"
                            class="text-red-500 hover:text-red-700 p-1 rounded transition-colors duration-200"
                            title="Excluir"
                        >
                            🗑️
                        </button>
                    </div>
                </div>
            `).join('');
            
            // Verificar se precisa mostrar indicador de rolagem
            setTimeout(() => {
                updateScrollIndicators();
            }, 100);
            
            // Atualizar contadores
            updateFixedBillsCounters();
        }
        
        // Atualizar também o modal se estiver aberto
        if (modalFixedBillsList && manageFixedBillsModal && !manageFixedBillsModal.classList.contains('hidden')) {
            await updateModalFixedBillsList();
        }
        
    } catch (error) {
        console.error('Erro ao atualizar lista de contas fixas:', error);
        if (fixedBillsList) {
            fixedBillsList.innerHTML = `
                <div class="text-center py-4">
                    <p class="text-red-500 text-sm">Erro ao carregar contas fixas</p>
                </div>
            `;
        }
    }
}

// Função auxiliar para obter nome de exibição da categoria
function getCategoryDisplayName(category) {
    const categoryNames = {
        'housing': 'Moradia',
        'utilities': 'Serviços',
        'entertainment': 'Entretenimento',
        'subscriptions': 'Assinaturas',
        'transport': 'Transporte',
        'health': 'Saúde',
        'education': 'Educação',
        'food': 'Alimentação',
        'insurance': 'Seguros',
        'other': 'Outros'
    };
    
    return categoryNames[category] || category;
}

// Funções para gerenciar contas fixas (escopo global para onclick)
window.toggleFixedBillStatus = async function(billId) {
    try {
        const bill = fixedBills.find(b => b.id === billId);
        if (!bill) return;
        
        const newStatus = !bill.isActive;
        await updateRecurringBill(billId, { isActive: newStatus });
        
        // Atualizar listas
        await updateFixedBillsList();
        
        // Mostrar mensagem de sucesso
        addChatMessage(`✅ Conta fixa "${bill.name}" ${newStatus ? 'ativada' : 'desativada'} com sucesso!`);
        
    } catch (error) {
        console.error('Erro ao alterar status da conta fixa:', error);
        addChatMessage('❌ Erro ao alterar status da conta fixa. Tente novamente.');
    }
};

window.deleteFixedBill = async function(billId) {
    try {
        const bill = fixedBills.find(b => b.id === billId);
        if (!bill) return;
        
        if (confirm(`Tem certeza que deseja excluir a conta fixa "${bill.name}"?`)) {
            await deleteRecurringBill(billId);
            
            // Atualizar listas
            await updateFixedBillsList();
            
            // Mostrar mensagem de sucesso
            addChatMessage(`✅ Conta fixa "${bill.name}" excluída com sucesso!`);
        }
        
    } catch (error) {
        console.error('Erro ao excluir conta fixa:', error);
        addChatMessage('❌ Erro ao excluir conta fixa. Tente novamente.');
    }
};

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', initApp);

// Verificar mudanças de tamanho da tela para responsividade
window.addEventListener('resize', () => {
    // Fechar menu mobile se a tela for redimensionada para desktop
    if (window.innerWidth > 1024 && sidebar.classList.contains('active')) {
        closeMobileMenu();
    }
    
    // Atualizar estatísticas quando a janela for redimensionada
    if (isAuthenticated) {
        updateFinancialStats();
    }
    
    // Ajustar layout baseado no tamanho da tela
    adjustLayoutForScreenSize();
});

// Função para ajustar o layout baseado no tamanho da tela
function adjustLayoutForScreenSize() {
    const isLargeScreen = window.innerWidth >= 1280;
    const isExtraLargeScreen = window.innerWidth >= 1536;
    
    // Ajustar espaçamento do chat baseado no tamanho da tela
    const chatMessages = document.getElementById('chat-messages');
    if (chatMessages) {
        if (isExtraLargeScreen) {
            chatMessages.style.padding = '2.5rem';
            chatMessages.style.fontSize = '1.125rem';
        } else if (isLargeScreen) {
            chatMessages.style.padding = '2rem';
            chatMessages.style.fontSize = '1rem';
        } else {
            chatMessages.style.padding = '1.5rem';
            chatMessages.style.fontSize = '0.875rem';
        }
    }
    
    // Ajustar tamanho das mensagens do chat
    const messageBubbles = document.querySelectorAll('.chat-message .assistant-message');
    messageBubbles.forEach(bubble => {
        if (isExtraLargeScreen) {
            bubble.style.maxWidth = '42rem';
            bubble.style.padding = '1.5rem';
        } else if (isLargeScreen) {
            bubble.style.maxWidth = '36rem';
            bubble.style.padding = '1.25rem';
        } else {
            bubble.style.maxWidth = '32rem';
            bubble.style.padding = '1rem';
        }
    });
}



















// ===== TEMA ESCURO FIXO =====
// O tema escuro é aplicado automaticamente via CSS
// Não há necessidade de JavaScript para alternar temas

// ===== FUNCIONALIDADE DE MANUTENÇÃO FINANCEIRA =====
function setupMaintenanceButton() {
    const maintenanceBtn = document.getElementById('maintenance-btn');
    if (!maintenanceBtn) return;
    
    maintenanceBtn.addEventListener('click', async () => {
        try {
            // Mostrar loading
            maintenanceBtn.innerHTML = '<span>⏳</span><span class="hidden xl:inline">Verificando...</span>';
            maintenanceBtn.disabled = true;
            
            // Importar funções de manutenção
            const { fixNegativeBalances, checkFinancialIntegrity } = await import('./firestoreService.js');
            
            // Verificar integridade primeiro
            addChatMessage('🔍 Verificando integridade financeira...', 'system');
            const integrityResult = await checkFinancialIntegrity();
            
            if (integrityResult.hasIssues) {
                addChatMessage(`⚠️ ${integrityResult.message}`, 'system');
                addChatMessage(`📊 Encontradas ${integrityResult.discrepancies.length} discrepâncias:`, 'system');
                
                integrityResult.discrepancies.forEach(discrepancy => {
                    addChatMessage(`• ${discrepancy.accountName}: Teórico R$ ${discrepancy.theoreticalBalance.toFixed(2)}, Real R$ ${discrepancy.actualBalance.toFixed(2)}`, 'system');
                });
            } else {
                addChatMessage(integrityResult.message, 'system');
            }
            
            // Corrigir saldos negativos
            addChatMessage('🔧 Verificando e corrigindo saldos negativos...', 'system');
            const fixResult = await fixNegativeBalances();
            
            if (fixResult.fixed > 0) {
                addChatMessage(`✅ ${fixResult.message}`, 'system');
                addChatMessage(`📝 Contas corrigidas:`, 'system');
                fixResult.accounts.forEach(account => {
                    addChatMessage(`• ${account.name}: De R$ ${account.oldBalance.toFixed(2)} para R$ 0.00`, 'system');
                });
                
                // Recarregar dados
                setTimeout(() => {
                    location.reload();
                }, 2000);
            } else {
                addChatMessage(fixResult.message, 'system');
            }
            
            addChatMessage('🎯 Manutenção financeira concluída! Seus dados estão agora organizados e consistentes.', 'system');
            
        } catch (error) {
            console.error('Erro na manutenção financeira:', error);
            addChatMessage(`❌ Erro na manutenção: ${error.message}`, 'system');
        } finally {
            // Restaurar botão
            maintenanceBtn.innerHTML = '<span>🔧</span><span class="hidden xl:inline">Manutenção</span>';
            maintenanceBtn.disabled = false;
        }
    });
}

// Inicializar botão de manutenção quando o app estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    // Aguardar um pouco para garantir que o app esteja carregado
    setTimeout(() => {
        setupMaintenanceButton();
    }, 1000);
});

// Função para gerenciar o modal de contas fixas
function initFixedBillsModal() {
    console.log('🔧 Inicializando modal de contas fixas...');
    console.log('🔍 Botão Overview:', showFixedBillsModalBtnOverview);
    console.log('🔍 Botão Tab:', showFixedBillsModalBtnTab);
    console.log('🔍 Modal:', manageFixedBillsModal);
    console.log('🔍 Botão Fechar:', closeManageFixedBillsBtn);
    
    // Função para abrir o modal
    const openModal = () => {
        console.log('🚀 Abrindo modal de contas fixas...');
        if (manageFixedBillsModal) {
            manageFixedBillsModal.classList.remove('hidden');
            updateModalFixedBillsList();
            console.log('✅ Modal aberto com sucesso!');
        } else {
            console.error('❌ Modal não encontrado!');
        }
    };
    
    // Função para fechar o modal
    const closeModal = () => {
        console.log('🚪 Fechando modal...');
        if (manageFixedBillsModal) {
            manageFixedBillsModal.classList.add('hidden');
            console.log('✅ Modal fechado com sucesso!');
        }
    };
    
    // Configurar eventos para ambos os botões
    if (showFixedBillsModalBtnOverview) {
        console.log('✅ Configurando evento para botão Overview');
        showFixedBillsModalBtnOverview.addEventListener('click', openModal);
    } else {
        console.warn('⚠️ Botão Overview não encontrado');
    }
    
    if (showFixedBillsModalBtnTab) {
        console.log('✅ Configurando evento para botão Tab');
        showFixedBillsModalBtnTab.addEventListener('click', openModal);
    } else {
        console.warn('⚠️ Botão Tab não encontrado');
    }
    
    // Fechar modal
    if (closeManageFixedBillsBtn) {
        console.log('✅ Configurando evento para botão Fechar');
        closeManageFixedBillsBtn.addEventListener('click', closeModal);
    } else {
        console.warn('⚠️ Botão Fechar não encontrado');
    }
    
    // Fechar modal clicando fora
    if (manageFixedBillsModal) {
        console.log('✅ Configurando eventos de fechamento do modal');
        manageFixedBillsModal.addEventListener('click', (event) => {
            if (event.target === manageFixedBillsModal) {
                closeModal();
            }
        });
        
        // Fechar modal com Escape
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && !manageFixedBillsModal.classList.contains('hidden')) {
                closeModal();
            }
        });
    } else {
        console.warn('⚠️ Modal não encontrado para configurar eventos');
    }
    
    // Configurar formulário de adição
    if (addFixedBillForm) {
        console.log('✅ Configurando formulário de adição');
        addFixedBillForm.addEventListener('submit', handleAddFixedBill);
    } else {
        console.warn('⚠️ Formulário de adição não encontrado');
    }
    
    console.log('🔧 Inicialização do modal concluída');
}

// Função para adicionar nova conta fixa
async function handleAddFixedBill(event) {
    event.preventDefault();
    
    const formData = new FormData(addFixedBillForm);
    const name = formData.get('fixed-bill-name') || document.getElementById('fixed-bill-name').value;
    const amount = parseFloat(formData.get('fixed-bill-amount') || document.getElementById('fixed-bill-amount').value);
    const dueDay = parseInt(formData.get('fixed-bill-due-day') || document.getElementById('fixed-bill-due-day').value);
    const category = formData.get('fixed-bill-category') || document.getElementById('fixed-bill-category').value;
    const frequency = formData.get('fixed-bill-frequency') || document.getElementById('fixed-bill-frequency').value;
    
    if (!name || !amount || !dueDay) {
        addChatMessage('❌ Por favor, preencha todos os campos obrigatórios.', 'error');
        return;
    }
    
    try {
        const newBill = {
            name: name.trim(),
            amount: amount,
            dueDay: dueDay,
            category: category,
            frequency: frequency,
            isActive: true,
            createdAt: new Date(),
            userId: currentUser.uid
        };
        
        await addRecurringBill(newBill);
        
        // Limpar formulário
        addFixedBillForm.reset();
        
        // Atualizar listas
        await updateFixedBillsList();
        await updateModalFixedBillsList();
        
        // Mostrar mensagem de sucesso
        addChatMessage(`✅ Conta fixa "${name}" criada com sucesso! Valor: R$ ${amount.toFixed(2)}, Vencimento: dia ${dueDay}`, 'success');
        
    } catch (error) {
        console.error('Erro ao criar conta fixa:', error);
        addChatMessage('❌ Erro ao criar conta fixa. Tente novamente.', 'error');
    }
}

// Função para atualizar a lista de contas fixas no modal
async function updateModalFixedBillsList() {
    try {
        if (!modalFixedBillsList) return;
        
        if (fixedBills.length === 0) {
            modalFixedBillsList.innerHTML = '';
            return;
        }
        
        modalFixedBillsList.innerHTML = fixedBills.map(bill => `
            <div class="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <div class="flex items-center justify-between">
                    <div class="flex-1">
                        <div class="flex items-center space-x-3 mb-2">
                            <h5 class="text-lg font-semibold text-gray-900">${bill.name}</h5>
                            <span class="text-xs px-2 py-1 rounded-full ${getCategoryBadgeClass(bill.category)}">
                                ${getCategoryDisplayName(bill.category)}
                            </span>
                        </div>
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                            <div>
                                <span class="font-medium">Valor:</span>
                                <span class="text-green-600 font-bold">R$ ${bill.amount.toFixed(2)}</span>
                            </div>
                            <div>
                                <span class="font-medium">Vencimento:</span>
                                <span class="text-blue-600">Dia ${bill.dueDay}</span>
                            </div>
                            <div>
                                <span class="font-medium">Frequência:</span>
                                <span class="text-purple-600">${getFrequencyDisplayName(bill.frequency)}</span>
                            </div>
                            <div>
                                <span class="font-medium">Status:</span>
                                <span class="${bill.isActive ? 'text-green-600' : 'text-red-600'}">
                                    ${bill.isActive ? '✅ Ativa' : '❌ Inativa'}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="flex space-x-2 ml-4">
                        <button 
                            onclick="toggleFixedBillStatus('${bill.id}')"
                            class="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors duration-200"
                            title="${bill.isActive ? 'Desativar' : 'Ativar'}"
                        >
                            ${bill.isActive ? '⏸️' : '▶️'}
                        </button>
                        <button 
                            onclick="deleteFixedBill('${bill.id}')"
                            class="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors duration-200"
                            title="Excluir"
                        >
                            🗑️
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
        
        // Verificar se precisa mostrar indicador de rolagem no modal
        setTimeout(() => {
            updateModalScrollIndicators();
        }, 100);
        
    } catch (error) {
        console.error('Erro ao atualizar lista modal de contas fixas:', error);
        modalFixedBillsList.innerHTML = `
            <div class="text-center py-4">
                <p class="text-red-500 text-sm">Erro ao carregar contas fixas</p>
            </div>
        `;
    }
}

// Função para obter classe CSS do badge da categoria
function getCategoryBadgeClass(category) {
    const classes = {
        'housing': 'bg-blue-600 text-white',
        'utilities': 'bg-green-600 text-white',
        'entertainment': 'bg-purple-600 text-white',
        'subscriptions': 'bg-yellow-600 text-white',
        'insurance': 'bg-red-600 text-white',
        'other': 'bg-gray-600 text-white'
    };
    return classes[category] || classes.other;
}

// Função para obter nome de exibição da frequência
function getFrequencyDisplayName(frequency) {
    const names = {
        'weekly': 'Semanal',
        'biweekly': 'Quinzenal',
        'monthly': 'Mensal',
        'yearly': 'Anual'
    };
    return names[frequency] || 'Mensal';
}

// Função para verificar e mostrar indicadores de rolagem nas listas principais
function updateScrollIndicators() {
    const fixedBillsList = document.getElementById('fixed-bills-list');
    const scrollIndicator = document.getElementById('fixed-bills-scroll-indicator');
    const scrollIndicatorTab = document.getElementById('fixed-bills-scroll-indicator-tab');
    
    if (fixedBillsList && scrollIndicator) {
        const needsScroll = fixedBillsList.scrollHeight > fixedBillsList.clientHeight;
        scrollIndicator.classList.toggle('hidden', !needsScroll);
    }
    
    if (fixedBillsList && scrollIndicatorTab) {
        const needsScroll = fixedBillsList.scrollHeight > fixedBillsList.clientHeight;
        scrollIndicatorTab.classList.toggle('hidden', !needsScroll);
    }
}

// Função para verificar e mostrar indicadores de rolagem no modal
function updateModalScrollIndicators() {
    const modalFixedBillsList = document.getElementById('modal-fixed-bills-list');
    const modalScrollIndicator = document.getElementById('modal-fixed-bills-scroll-indicator');
    
    if (modalFixedBillsList && modalScrollIndicator) {
        const needsScroll = modalFixedBillsList.scrollHeight > modalFixedBillsList.clientHeight;
        modalScrollIndicator.classList.toggle('hidden', !needsScroll);
    }
}

// Função para atualizar contadores de contas fixas
function updateFixedBillsCounters() {
    const countOverview = document.getElementById('fixed-bills-count');
    const countTab = document.getElementById('fixed-bills-count-tab');
    
    if (countOverview) {
        countOverview.textContent = fixedBills.length;
    }
    
    if (countTab) {
        countTab.textContent = fixedBills.length;
    }
}

// Função para configurar listeners de redimensionamento para atualizar indicadores
function setupScrollIndicatorListeners() {
    // Atualizar indicadores quando a janela for redimensionada
    window.addEventListener('resize', () => {
        setTimeout(() => {
            updateScrollIndicators();
            updateModalScrollIndicators();
        }, 100);
    });
    
    // Atualizar indicadores quando o modal for aberto/fechado
    const manageFixedBillsModal = document.getElementById('manage-fixed-bills-modal');
    if (manageFixedBillsModal) {
        const observer = new MutationObserver(() => {
            if (!manageFixedBillsModal.classList.contains('hidden')) {
                setTimeout(() => {
                    updateModalScrollIndicators();
                }, 200);
            }
        });
        
        observer.observe(manageFixedBillsModal, {
            attributes: true,
            attributeFilter: ['class']
        });
    }
}

// 🚀 NOVA FUNÇÃO: Resumo Financeiro Inteligente com Contas Fixas
async function generateIntelligentFinancialSummary(transactions, fixedBills, accounts, period, startDate, endDate) {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // 📊 Estatísticas básicas
    let totalIncome = 0;
    let totalExpenses = 0;
    const expensesByCategory = {};
    const accountNamesLower = new Set(
        (accounts || [])
            .filter(acc => acc && acc.name)
            .map(acc => acc.name.toLowerCase())
    );
    
    // 🔍 Processar transações
    transactions.forEach(transaction => {
        if (transaction.type === 'income') {
            totalIncome += transaction.amount || 0;
        } else if (transaction.type === 'expense') {
            totalExpenses += transaction.amount || 0;
            
            let category = (transaction.description || 'Sem descrição').trim();
            if (accountNamesLower.has(category.toLowerCase())) {
                category = 'Sem descrição';
            }
            if (!expensesByCategory[category]) {
                expensesByCategory[category] = 0;
            }
            expensesByCategory[category] += (transaction.amount || 0);
        }
    });
    
    // 🏠 Análise das Contas Fixas
    let fixedBillsAnalysis = '';
    let totalFixedBillsAmount = 0;
    let paidFixedBills = 0;
    let unpaidFixedBills = 0;
    let overdueFixedBills = 0;
    let upcomingFixedBills = 0;
    
    if (fixedBills && fixedBills.length > 0) {
        fixedBillsAnalysis = '\n🏠 **ANÁLISE DAS CONTAS FIXAS:**\n';
        
        // Agrupar contas fixas por status
        const billsByStatus = {
            paid: [],
            unpaid: [],
            overdue: [],
            upcoming: []
        };
        
        fixedBills.forEach(bill => {
            if (!bill.amount || bill.amount <= 0) return;
            
            totalFixedBillsAmount += bill.amount;
            
            // 🔍 Verificar se foi paga este mês
            const billPaidThisMonth = transactions.some(t => 
                t.type === 'expense' && 
                t.description && 
                t.description.toLowerCase().includes(bill.name.toLowerCase()) &&
                t.createdAt && 
                new Date(t.createdAt.toDate()) >= startDate &&
                new Date(t.createdAt.toDate()) <= endDate
            );
            
            // 📅 Calcular vencimento
            let dueDate = null;
            let daysUntilDue = null;
            let isOverdue = false;
            
            if (bill.dueDay && bill.dueDay > 0) {
                // Criar data de vencimento para este mês
                dueDate = new Date(currentYear, currentMonth, bill.dueDay);
                
                // Se já passou do vencimento este mês, verificar próximo mês
                if (dueDate < today) {
                    dueDate = new Date(currentYear, currentMonth + 1, bill.dueDay);
                }
                
                daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
                isOverdue = daysUntilDue < 0;
            }
            
            const billInfo = {
                ...bill,
                dueDate,
                daysUntilDue,
                isOverdue,
                paidThisMonth: billPaidThisMonth
            };
            
            if (billPaidThisMonth) {
                billsByStatus.paid.push(billInfo);
                paidFixedBills++;
            } else if (isOverdue) {
                billsByStatus.overdue.push(billInfo);
                overdueFixedBills++;
            } else if (daysUntilDue <= 7) {
                billsByStatus.upcoming.push(billInfo);
                upcomingFixedBills++;
            } else {
                billsByStatus.unpaid.push(billInfo);
                unpaidFixedBills++;
            }
        });
        
        // 📋 Contas Pagas
        if (billsByStatus.paid.length > 0) {
            fixedBillsAnalysis += `\n✅ **CONTAS PAGAS (${billsByStatus.paid.length}):**\n`;
            billsByStatus.paid.forEach(bill => {
                fixedBillsAnalysis += `• ${bill.name}: R$ ${bill.amount.toFixed(2)} ✅\n`;
            });
        }
        
        // ⚠️ Contas Vencidas
        if (billsByStatus.overdue.length > 0) {
            fixedBillsAnalysis += `\n🚨 **CONTAS VENCIDAS (${billsByStatus.overdue.length}):**\n`;
            billsByStatus.overdue.forEach(bill => {
                const overdueDays = Math.abs(bill.daysUntilDue);
                fixedBillsAnalysis += `• ${bill.name}: R$ ${bill.amount.toFixed(2)} - Vencida há ${overdueDays} dia${overdueDays > 1 ? 's' : ''} ⚠️\n`;
            });
        }
        
        // 🔔 Contas Próximas do Vencimento
        if (billsByStatus.upcoming.length > 0) {
            fixedBillsAnalysis += `\n🔔 **VENCENDO EM BREVE (${billsByStatus.upcoming.length}):**\n`;
            billsByStatus.upcoming.forEach(bill => {
                const urgency = bill.daysUntilDue <= 3 ? '🚨' : bill.daysUntilDue <= 5 ? '⚠️' : '🔔';
                fixedBillsAnalysis += `• ${bill.name}: R$ ${bill.amount.toFixed(2)} - Vence em ${bill.daysUntilDue} dia${bill.daysUntilDue > 1 ? 's' : ''} ${urgency}\n`;
            });
        }
        
        // 📝 Contas Pendentes
        if (billsByStatus.unpaid.length > 0) {
            fixedBillsAnalysis += `\n📝 **CONTAS PENDENTES (${billsByStatus.unpaid.length}):**\n`;
            billsByStatus.unpaid.forEach(bill => {
                if (bill.dueDate) {
                    const daysUntilDue = bill.daysUntilDue;
                    fixedBillsAnalysis += `• ${bill.name}: R$ ${bill.amount.toFixed(2)} - Vence em ${daysUntilDue} dia${daysUntilDue > 1 ? 's' : ''}\n`;
                } else {
                    fixedBillsAnalysis += `• ${bill.name}: R$ ${bill.amount.toFixed(2)} - Sem data de vencimento\n`;
                }
            });
        }
        
        // 💰 Resumo das Contas Fixas
        const totalPaidAmount = billsByStatus.paid.reduce((sum, bill) => sum + bill.amount, 0);
        const totalUnpaidAmount = totalFixedBillsAmount - totalPaidAmount;
        
        fixedBillsAnalysis += `\n💰 **RESUMO DAS CONTAS FIXAS:**\n`;
        fixedBillsAnalysis += `• Total mensal: R$ ${totalFixedBillsAmount.toFixed(2)}\n`;
        fixedBillsAnalysis += `• Já pagas: R$ ${totalPaidAmount.toFixed(2)} (${paidFixedBills}/${fixedBills.length})\n`;
        fixedBillsAnalysis += `• Pendentes: R$ ${totalUnpaidAmount.toFixed(2)} (${unpaidFixedBills + overdueFixedBills + upcomingFixedBills}/${fixedBills.length})\n`;
    }
    
    // 📊 Estatísticas por Categoria
    let categoryAnalysis = '';
    if (Object.keys(expensesByCategory).length > 0) {
        const sortedExpenses = Object.entries(expensesByCategory)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5); // Top 5 despesas
        
        categoryAnalysis = '\n🔍 **PRINCIPAIS DESPESAS POR CATEGORIA:**\n';
        sortedExpenses.forEach(([category, amount], index) => {
            const emoji = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '•';
            const percentage = ((amount / totalExpenses) * 100).toFixed(1);
            categoryAnalysis += `${emoji} ${category}: R$ ${amount.toFixed(2)} (${percentage}%)\n`;
        });
    }
    
    // 🏦 Saldo das Contas
    let accountsSummary = '';
    if (accounts && accounts.length > 0) {
        const totalBalance = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
        const accountDetails = accounts
            .filter(acc => acc.balance !== undefined)
            .sort((a, b) => (b.balance || 0) - (a.balance || 0))
            .slice(0, 3); // Top 3 contas
        
        accountsSummary = '\n🏦 **SALDO DAS CONTAS:**\n';
        accountsSummary += `💰 Saldo total: R$ ${totalBalance.toFixed(2)}\n\n`;
        
        if (accountDetails.length > 0) {
            accountsSummary += '**Principais contas:**\n';
            accountDetails.forEach(acc => {
                const balance = acc.balance || 0;
                const emoji = balance >= 0 ? '✅' : '❌';
                accountsSummary += `${emoji} ${acc.name}: R$ ${balance.toFixed(2)}\n`;
            });
        }
    }
    
    // 📈 Análise de Tendências
    let trendAnalysis = '';
    if (transactions.length > 0) {
        const avgDailyExpense = totalExpenses / Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)));
        const remainingDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate() - today.getDate();
        const projectedMonthlyExpenses = totalExpenses + (avgDailyExpense * remainingDaysInMonth);
        
        trendAnalysis = '\n📈 **ANÁLISE DE TENDÊNCIAS:**\n';
        trendAnalysis += `• Gasto médio diário: R$ ${avgDailyExpense.toFixed(2)}\n`;
        trendAnalysis += `• Projeção mensal: R$ ${projectedMonthlyExpenses.toFixed(2)}\n`;
        
        if (totalFixedBillsAmount > 0) {
            const fixedBillsPercentage = ((totalFixedBillsAmount / projectedMonthlyExpenses) * 100).toFixed(1);
            trendAnalysis += `• Contas fixas representam: ${fixedBillsPercentage}% do gasto projetado\n`;
        }
        
        // 🎯 Recomendações
        if (overdueFixedBills > 0) {
            trendAnalysis += `\n🚨 **ALERTA:** Você tem ${overdueFixedBills} conta(s) vencida(s)! Priorize o pagamento.\n`;
        }
        
        if (upcomingFixedBills > 0) {
            trendAnalysis += `\n🔔 **ATENÇÃO:** ${upcomingFixedBills} conta(s) vence(m) em breve. Prepare-se!\n`;
        }
        
        if (totalExpenses > totalIncome) {
            trendAnalysis += `\n⚠️ **ATENÇÃO:** Seus gastos estão superando suas receitas este mês.\n`;
        }
    }
    
    // 🎨 Montar o resumo final
    let summary = `📊 **RESUMO FINANCEIRO INTELIGENTE - ${period.toUpperCase()}**\n`;
    summary += `📅 Período: ${startDate.toLocaleDateString('pt-BR')} a ${endDate.toLocaleDateString('pt-BR')}\n\n`;
    
    // Resumo básico
    summary += `💰 **RECEITAS:** R$ ${totalIncome.toFixed(2)}\n`;
    summary += `💸 **DESPESAS:** R$ ${totalExpenses.toFixed(2)}\n`;
    summary += `💵 **SALDO DO PERÍODO:** R$ ${(totalIncome - totalExpenses).toFixed(2)}\n`;
    
    // Adicionar análises
    summary += fixedBillsAnalysis;
    summary += categoryAnalysis;
    summary += accountsSummary;
    summary += trendAnalysis;
    
    // 🎯 Resumo executivo
    summary += `\n🎯 **RESUMO EXECUTIVO:**\n`;
    if (overdueFixedBills > 0) {
        summary += `🚨 Prioridade máxima: Pagar ${overdueFixedBills} conta(s) vencida(s)\n`;
    }
    if (upcomingFixedBills > 0) {
        summary += `🔔 Prepare-se: ${upcomingFixedBills} conta(s) vence(m) em breve\n`;
    }
    if (totalExpenses > totalIncome) {
        summary += `⚠️ Atenção: Controle seus gastos para não ficar no vermelho\n`;
    }
    if (overdueFixedBills === 0 && upcomingFixedBills === 0 && totalExpenses <= totalIncome) {
        summary += `✅ Excelente! Suas finanças estão em ordem\n`;
    }
    
    return summary;
}
