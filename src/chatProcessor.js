// Processador de Linguagem Natural Inteligente para o Dinah
// Sistema avançado de IA com reconhecimento de contexto e aprendizado

// Constante para limite de confirmação
const CONFIRMATION_LIMIT = 1000; // R$ 1000

// Base de conhecimento sobre bancos e apelidos
const BANK_KNOWLEDGE = {
    // Bancos tradicionais
    'nubank': {
        names: ['nubank', 'nu bank', 'nu', 'roxinho', 'cartão roxo', 'nubanco', 'nubank', 'nu banco', 'cartão roxo', 'roxinho'],
        type: 'digital',
        category: 'banco digital'
    },
    'itau': {
        names: ['itau', 'itaú', 'itau unibanco', 'itaú unibanco', 'itau', 'itaubanco', 'itaú banco', 'itau banco', 'unibanco'],
        type: 'tradicional',
        category: 'banco tradicional'
    },
    'bradesco': {
        names: ['bradesco', 'banco bradesco', 'bradisco', 'bradisco', 'banco bradisco', 'bradisco banco'],
        type: 'tradicional',
        category: 'banco tradicional'
    },
    'santander': {
        names: ['santander', 'banco santander', 'santander banco', 'santander', 'santander'],
        type: 'tradicional',
        category: 'banco tradicional'
    },
    'bb': {
        names: ['bb', 'banco do brasil', 'banco do brasil bb', 'bancodobrasil', 'banco brasil', 'banco do brasil', 'bb banco', 'banco bb'],
        type: 'tradicional',
        category: 'banco público'
    },
    'caixa': {
        names: ['caixa', 'caixa econômica', 'caixa economica', 'caixa econômica federal', 'caixa economica federal', 'cef', 'caxa', 'caixa federal', 'caixa federal'],
        type: 'tradicional',
        category: 'banco público'
    },
    
    // Bancos digitais
    'inter': {
        names: ['inter', 'banco inter', 'bancointer', 'inter medium', 'banco inter', 'inter banco', 'banco inter', 'inter'],
        type: 'digital',
        category: 'banco digital'
    },
    'c6': {
        names: ['c6', 'c6 bank', 'c6bank', 'banco c6', 'c6 banco', 'banco c6', 'c6bank', 'c6 bank'],
        type: 'digital',
        category: 'banco digital'
    },
    'picpay': {
        names: ['picpay', 'pic pay', 'picpay bank', 'pic pay bank', 'picpay banco', 'pic pay banco', 'picpay', 'pic pay'],
        type: 'digital',
        category: 'banco digital'
    },
    'mercado pago': {
        names: ['mercado pago', 'mercadopago', 'mercado pago bank', 'mercadopago bank', 'mercado pago banco', 'mercadopago banco', 'mercado pago', 'mercadopago'],
        type: 'digital',
        category: 'banco digital'
    },
    
    // Apelidos comuns
    'caixinha': {
        names: ['caixinha', 'caixa', 'poupança', 'poupança caixa', 'caixa econômica', 'caixa economica', 'caixinha caixa', 'poupança caixa econômica', 'poupança caixa economica', 'cef poupança', 'cef poupança'],
        type: 'tradicional',
        category: 'banco público'
    },
    'conta pessoal': {
        names: ['conta pessoal', 'conta pessoal', 'conta principal', 'conta principal', 'conta pessoal', 'conta pessoal', 'conta principal', 'conta principal'],
        type: 'generic',
        category: 'conta principal'
    },
    'conta empresarial': {
        names: ['conta empresarial', 'conta empresa', 'conta business', 'conta trabalho', 'conta empresarial', 'conta empresa', 'conta business', 'conta trabalho'],
        type: 'generic',
        category: 'conta empresarial'
    },
    'pouçança': {
        names: ['pouçança', 'poupança', 'poupança caixa', 'caixinha', 'poupança caixa econômica', 'poupança caixa economica', 'poupança cef', 'poupança caixa federal', 'poupança caixa federal'],
        type: 'tradicional',
        category: 'poupança'
    }
};

// Base de conhecimento sobre contas fixas
const FIXED_BILLS_KNOWLEDGE = {
    'aluguel': {
        category: 'housing',
        commonAmounts: [800, 1000, 1200, 1500, 2000, 2500, 3000],
        dueDays: [5, 10, 15, 20],
        synonyms: ['aluguel', 'rent', 'locação', 'locacao']
    },
    'condomínio': {
        category: 'housing',
        commonAmounts: [200, 300, 400, 500, 600, 800, 1000],
        dueDays: [5, 10, 15, 20],
        synonyms: ['condomínio', 'condominio', 'condo', 'taxa condominial']
    },
    'internet': {
        category: 'subscriptions',
        commonAmounts: [50, 80, 100, 120, 150, 200],
        dueDays: [5, 10, 15, 20],
        synonyms: ['internet', 'wi-fi', 'wifi', 'banda larga', 'provedor']
    },
    'energia': {
        category: 'utilities',
        commonAmounts: [80, 120, 150, 200, 250, 300, 400],
        dueDays: [5, 10, 15, 20],
        synonyms: ['energia', 'luz', 'eletricidade', 'conta de luz', 'conta de energia']
    },
    'água': {
        category: 'utilities',
        commonAmounts: [30, 50, 80, 100, 120, 150],
        dueDays: [5, 10, 15, 20],
        synonyms: ['água', 'agua', 'conta de água', 'conta de agua', 'saneamento']
    },
    'gás': {
        category: 'utilities',
        commonAmounts: [40, 60, 80, 100, 120, 150],
        dueDays: [5, 10, 15, 20],
        synonyms: ['gás', 'gas', 'conta de gás', 'conta de gas', 'gás natural']
    },
    'netflix': {
        category: 'entertainment',
        commonAmounts: [25, 30, 40, 50],
        dueDays: [1, 5, 10, 15],
        synonyms: ['netflix', 'netflix streaming']
    },
    'spotify': {
        category: 'entertainment',
        commonAmounts: [17, 20, 25, 30],
        dueDays: [1, 5, 10, 15],
        synonyms: ['spotify', 'spotify premium', 'música', 'musica']
    }
};

// Função para calcular similaridade entre palavras (distância de Levenshtein)
function calculateWordSimilarity(word1, word2) {
    const matrix = [];
    
    for (let i = 0; i <= word2.length; i++) {
        matrix[i] = [i];
    }
    
    for (let j = 0; j <= word1.length; j++) {
        matrix[0][j] = j;
    }
    
    for (let i = 1; i <= word2.length; i++) {
        for (let j = 1; j <= word1.length; j++) {
            if (word2.charAt(i - 1) === word1.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // substituição
                    matrix[i][j - 1] + 1,      // inserção
                    matrix[i - 1][j] + 1       // remoção
                );
            }
        }
    }
    
    const maxLength = Math.max(word1.length, word2.length);
    const similarity = 1 - (matrix[word2.length][word1.length] / maxLength);
    return similarity;
}

// Função para corrigir erros de digitação em palavras-chave
function correctTypo(word, correctWords, threshold = 0.7) {
    let bestMatch = null;
    let bestSimilarity = 0;
    
    for (const correctWord of correctWords) {
        const similarity = calculateWordSimilarity(word.toLowerCase(), correctWord.toLowerCase());
        if (similarity > bestSimilarity && similarity >= threshold) {
            bestSimilarity = similarity;
            bestMatch = correctWord;
        }
    }
    
    return bestMatch;
}

// Função para verificar se uma palavra está "perto" de uma palavra correta
function isCloseToCorrect(word, correctWords, threshold = 0.7) {
    return correctTypo(word, correctWords, threshold) !== null;
}

// Sistema de contexto e memória inteligente
class ChatContext {
    constructor() {
        this.conversationHistory = [];
        this.userPreferences = {};
        this.lastActions = [];
        this.commonPatterns = {};
        this.confidenceScores = {};
        this.suggestions = [];
        this.maxHistory = 50;
    }

    addMessage(message, response, confidence) {
        this.conversationHistory.push({
            message: message.toLowerCase(),
            response: response,
            confidence: confidence,
            timestamp: Date.now(),
            intent: this.extractIntent(message)
        });

        // Manter apenas as últimas mensagens
        if (this.conversationHistory.length > this.maxHistory) {
            this.conversationHistory.shift();
        }

        // Aprender padrões
        this.learnPatterns(message, response, confidence);
    }

    extractIntent(message) {
        const lowerMsg = message.toLowerCase();
        
        if (lowerMsg.includes('gastei') || lowerMsg.includes('paguei')) return 'expense';
        if (lowerMsg.includes('recebi') || lowerMsg.includes('ganhei')) return 'income';
        if (lowerMsg.includes('transferir') || lowerMsg.includes('transferi')) return 'transfer';
        if (lowerMsg.includes('criar conta') || lowerMsg.includes('nova conta')) return 'create_account';
        if (lowerMsg.includes('saldo') || lowerMsg.includes('quanto tenho')) return 'balance';
        if (lowerMsg.includes('resumo') || lowerMsg.includes('quanto gastei') || lowerMsg.includes('historico') || lowerMsg.includes('relatorio')) return 'summary';
        
        return 'unknown';
    }

    learnPatterns(message, response, confidence) {
        const words = message.toLowerCase().split(/\s+/);
        
        words.forEach(word => {
            if (word.length > 2) { // Ignorar palavras muito curtas
                if (!this.commonPatterns[word]) {
                    this.commonPatterns[word] = { count: 0, success: 0 };
                }
                this.commonPatterns[word].count++;
                if (confidence > 0.7) {
                    this.commonPatterns[word].success++;
                }
            }
        });
    }

    getSuggestions(message, userAccounts) {
        const suggestions = [];
        
        // Apenas sugestões essenciais - sem poluir o chat
        if (userAccounts.length === 0) {
            suggestions.push('🏦 Que tal criar sua primeira conta? Tente: "Criar conta principal"');
        }
        
        return suggestions;
    }

    getConfidence(message, intent) {
        let confidence = 0.5; // Base

        // Aumentar confiança baseado em palavras-chave específicas
        const keywords = {
            expense: ['gastei', 'paguei', 'despesa', 'comprei', 'gasto'],
            income: ['recebi', 'ganhei', 'receita', 'salário', 'freela'],
            transfer: ['transferir', 'transferi', 'mover', 'de', 'para'],
            create_account: ['criar conta', 'nova conta', 'adicionar conta'],
            balance: ['saldo', 'quanto tenho', 'meu saldo'],
            summary: ['resumo', 'quanto gastei', 'quanto recebi', 'historico', 'relatorio', 'resumo melhorado', 'historico detalhado'],
            specific_query: ['quanto gastei', 'quanto recebi', 'quanto ganhei', 'ontem', 'hoje', 'esta semana', 'este mês', 'última semana'],
            fixed_bill: ['aluguel', 'conta', 'fixa', 'mensal', 'todo mês', 'mensalmente', 'recorrente']
        };

        const intentKeywords = keywords[intent] || [];
        const messageLower = message.toLowerCase();
        
        intentKeywords.forEach(keyword => {
            if (messageLower.includes(keyword)) {
                confidence += 0.2;
            }
        });

        // Aumentar confiança baseado em padrões aprendidos
        const words = messageLower.split(/\s+/);
        words.forEach(word => {
            if (this.commonPatterns[word]) {
                const successRate = this.commonPatterns[word].success / this.commonPatterns[word].count;
                confidence += successRate * 0.1;
            }
        });

        return Math.min(confidence, 1.0);
    }
}

// Instância global do contexto
const chatContext = new ChatContext();

// Sistema de sugestões inteligentes baseado em contexto
class SmartSuggestions {
    constructor() {
        this.contextPatterns = {};
        this.userBehavior = {};
        this.commonMistakes = {};
        this.suggestionTemplates = {
            expense: [
                
            ],
            income: [
                
            ],
            transfer: [
                
            ],
            account: [
                
            ]
        };
    }

    generateContextualSuggestions(message, userAccounts, lastIntent) {
        const suggestions = [];
        const lowerMsg = message.toLowerCase();

        // Sugestões baseadas no contexto da mensagem


        // Apenas sugestões essenciais - sem poluir o chat
        if (userAccounts.length === 0) {
            suggestions.push('🏦 Que tal criar sua primeira conta? Tente: "Criar conta principal"');
        }

        return suggestions;
    }

    generateProactiveSuggestions(userAccounts, recentTransactions) {
        const suggestions = [];
        
        // Apenas sugestões essenciais - sem poluir o chat
        if (userAccounts.length === 0) {
            suggestions.push('🏦 Que tal criar sua primeira conta? Tente: "Criar conta principal"');
        }
        
        return suggestions;
    }
}

// Instância global das sugestões inteligentes
const smartSuggestions = new SmartSuggestions();

// Funções auxiliares para interpretar períodos de tempo
function parseTimePeriod(message) {
    const normalizedMessage = message.toLowerCase();
    console.log('🔍 parseTimePeriod chamado com:', normalizedMessage);
    
    // Períodos relativos
    if (normalizedMessage.includes('hoje')) {
        console.log('🔍 Encontrou "hoje"');
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
        return { startDate: startOfDay, endDate: endOfDay, period: 'hoje' };
    }
    
    if (normalizedMessage.includes('ontem')) {
        console.log('🔍 Encontrou "ontem"');
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const startOfDay = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
        const endOfDay = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59, 59);
        return { startDate: startOfDay, endDate: endOfDay, period: 'ontem' };
    }
    
    if (normalizedMessage.includes('esta semana') || normalizedMessage.includes('semana atual')) {
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay()); // Domingo
        startOfWeek.setHours(0, 0, 0, 0);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);
        return { startDate: startOfWeek, endDate: endOfWeek, period: 'esta semana' };
    }
    
    if (normalizedMessage.includes('este mês') || normalizedMessage.includes('mês atual')) {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);
        return { startDate: startOfMonth, endDate: endOfMonth, period: 'este mês' };
    }
    
    if (normalizedMessage.includes('mês passado') || normalizedMessage.includes('último mês')) {
        const today = new Date();
        const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59);
        return { startDate: startOfLastMonth, endDate: endOfLastMonth, period: 'mês passado' };
    }
    
    // Períodos específicos por nome do mês
    const monthNames = {
        'janeiro': 0, 'fevereiro': 1, 'março': 2, 'abril': 3, 'maio': 4, 'junho': 5,
        'julho': 6, 'agosto': 7, 'setembro': 8, 'outubro': 9, 'novembro': 10, 'dezembro': 11
    };
    
    for (const [monthName, monthIndex] of Object.entries(monthNames)) {
        if (normalizedMessage.includes(monthName)) {
            const currentYear = new Date().getFullYear();
            const startOfMonth = new Date(currentYear, monthIndex, 1);
            const endOfMonth = new Date(currentYear, monthIndex + 1, 0, 23, 59, 59);
            return { startDate: startOfMonth, endDate: endOfMonth, period: monthName };
        }
    }
    
    // Períodos específicos por número do mês
    const monthNumberMatch = normalizedMessage.match(/mês\s+(\d{1,2})/);
    if (monthNumberMatch) {
        const monthIndex = parseInt(monthNumberMatch[1]) - 1;
        if (monthIndex >= 0 && monthIndex <= 11) {
            const currentYear = new Date().getFullYear();
            const startOfMonth = new Date(currentYear, monthIndex, 1);
            const endOfMonth = new Date(currentYear, monthIndex + 1, 0, 23, 59, 59);
            return { startDate: startOfMonth, endDate: endOfMonth, period: `mês ${monthNumberMatch[1]}` };
        }
    }
    
    // Intervalos específicos de dias
    const dayRangeMatch = normalizedMessage.match(/do\s+dia\s+(\d{1,2})\s+(?:ao|até|até\s+o)\s+dia\s+(\d{1,2})/);
    if (dayRangeMatch) {
        const startDay = parseInt(dayRangeMatch[1]);
        const endDay = parseInt(dayRangeMatch[2]);
        
        if (startDay >= 1 && startDay <= 31 && endDay >= 1 && endDay <= 31) {
            // Assumir mês atual por padrão
            const today = new Date();
            const startDate = new Date(today.getFullYear(), today.getMonth(), startDay);
            const endDate = new Date(today.getFullYear(), today.getMonth(), endDay, 23, 59, 59);
            
            return { 
                startDate: startDate, 
                endDate: endDate, 
                period: `do dia ${startDay} ao dia ${endDay}`,
                needsMonthClarification: true 
            };
        }
    }
    
    // Buscar por padrões mais simples
    if (normalizedMessage.includes('quanto gastei') || normalizedMessage.includes('quanto recebi')) {
        // Se não especificou período, assumir mês atual
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);
        return { startDate: startOfMonth, endDate: endOfMonth, period: 'este mês' };
    }
    
    return null;
}

// Função para gerar resumo financeiro
async function generateFinancialSummary(transactions, period) {
    if (transactions.length === 0) {
        return `No período ${period}, não encontrei nenhuma transação.`;
    }
    
    let totalIncome = 0;
    let totalExpenses = 0;
    const expensesByCategory = {};
    
    transactions.forEach(transaction => {
        if (transaction.type === 'income') {
            totalIncome += transaction.amount || 0;
        } else if (transaction.type === 'expense') {
            totalExpenses += transaction.amount || 0;
            
            // Agrupar despesas por categoria/descrição
            const category = transaction.description || 'Sem categoria';
            expensesByCategory[category] = (expensesByCategory[category] || 0) + (transaction.amount || 0);
        }
    });
    
    // Ordenar despesas por valor (maiores primeiro)
    const sortedExpenses = Object.entries(expensesByCategory)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3); // Top 3 despesas
    
    let summary = `📊 **Resumo do período ${period}:**\n\n`;
    summary += `💰 **Receitas:** R$ ${totalIncome.toFixed(2)}\n`;
    summary += `💸 **Despesas:** R$ ${totalExpenses.toFixed(2)}\n`;
    summary += `💵 **Saldo:** R$ ${(totalIncome - totalExpenses).toFixed(2)}\n`;
    
    if (sortedExpenses.length > 0) {
        summary += `\n🔍 **Principais despesas:**\n`;
        sortedExpenses.forEach(([category, amount]) => {
            summary += `• ${category}: R$ ${amount.toFixed(2)}\n`;
        });
    }
    
    // Mostrar algumas transações recentes com horário
    const recentTransactions = transactions
        .sort((a, b) => new Date(b.createdAt?.toDate()) - new Date(a.createdAt?.toDate()))
        .slice(0, 5);
    
    if (recentTransactions.length > 0) {
        summary += `\n🕐 **Transações recentes:**\n`;
        recentTransactions.forEach(transaction => {
            const time = transaction.createdAt ? new Date(transaction.createdAt.toDate()).toLocaleTimeString('pt-BR', { 
                hour: '2-digit', 
                minute: '2-digit' 
            }) : 'horário não registrado';
            const type = transaction.type === 'income' ? '💰' : '💸';
            summary += `• ${type} ${transaction.description} - R$ ${transaction.amount.toFixed(2)} (${time})\n`;
        });
    }
    
    return summary;
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

// Função principal inteligente para processar mensagens do chat
export async function processChatMessage(message, userAccounts, conversationContext = {}, fixedBills = []) {
    const lowerMessage = message.toLowerCase().trim();
    
    // Adicionar mensagem ao contexto
    chatContext.addMessage(message, null, 0);
    
    // Verificar se é uma mensagem contextual (período apenas)
    if (conversationContext.lastIntent === 'get_summary' && isPeriodOnlyMessage(lowerMessage)) {
        return processContextualSummary(lowerMessage, conversationContext);
    }
    
    // Verificar se é uma intenção de correção
    if (isCorrectLastActionIntent(lowerMessage)) {
        return processCorrectLastActionIntent();
    }
    
    // Sistema inteligente de reconhecimento de intenções
    const intentResults = await analyzeIntent(message, userAccounts, fixedBills);
    
    // Evitar erro quando nenhuma intenção é encontrada (ex.: usuário respondeu apenas "nubank")
    if (!intentResults || intentResults.length === 0) {
        return {
            status: 'error',
            response: 'Desculpe, não entendi. Se estamos registrando uma transação, diga a conta (ex.: "Nubank") ou a descrição (ex.: "pastel").'
        };
    }
    
    // Selecionar a melhor intenção baseada na confiança
    const bestIntent = intentResults.reduce((best, current) => 
        current.confidence > best.confidence ? current : best
    );
    
    // Adicionar sugestões inteligentes
    const suggestions = chatContext.getSuggestions(message, userAccounts);
    
    // Processar a intenção selecionada
    const result = processIntent(bestIntent, userAccounts);
    
    // Adicionar sugestões se a confiança for baixa
    if (bestIntent.confidence < 0.6 && suggestions.length > 0) {
        result.suggestions = suggestions;

    }
    
    // Atualizar contexto com a resposta
    chatContext.addMessage(message, result.response, bestIntent.confidence);
    
    return result;
}

// Função para processar mensagens com inteligência avançada
export async function processChatMessageAdvanced(message, userAccounts, conversationContext = {}, recentTransactions = [], fixedBills = []) {
    const lowerMessage = message.toLowerCase().trim();
    
    // Adicionar mensagem ao contexto
    chatContext.addMessage(message, null, 0);
    
    // Verificar se é uma mensagem contextual (período apenas)
    if (conversationContext.lastIntent === 'get_summary' && isPeriodOnlyMessage(lowerMessage)) {
        return processContextualSummary(lowerMessage, conversationContext);
    }
    
    // Verificar se é uma intenção de correção
    if (isCorrectLastActionIntent(lowerMessage)) {
        return processCorrectLastActionIntent();
    }
    
    // Sistema inteligente de reconhecimento de intenções
    const intentResults = await analyzeIntent(message, userAccounts, fixedBills);
    
    // Evitar erro quando nenhuma intenção é encontrada (ex.: respostas curtas como "nubank")
    if (!intentResults || intentResults.length === 0) {
        return {
            status: 'error',
            response: 'Desculpe, não entendi. Se estamos registrando uma transação, diga a conta (ex.: "Nubank") ou a descrição (ex.: "pastel").'
        };
    }
    
    // Selecionar a melhor intenção baseada na confiança
    const bestIntent = intentResults.reduce((best, current) => 
        current.confidence > best.confidence ? current : best
    );
    
    // Gerar sugestões inteligentes baseadas no contexto
    const contextualSuggestions = smartSuggestions.generateContextualSuggestions(
        message, 
        userAccounts, 
        conversationContext.lastIntent
    );
    
    // Gerar sugestões proativas
    const proactiveSuggestions = smartSuggestions.generateProactiveSuggestions(
        userAccounts, 
        recentTransactions
    );
    
    // Processar a intenção selecionada
    const result = processIntent(bestIntent, userAccounts, fixedBills);
    
    // Adicionar sugestões contextuais se a confiança for baixa
    if (bestIntent.confidence < 0.6 && contextualSuggestions.length > 0) {
        result.suggestions = contextualSuggestions;

    }
    
    // Adicionar sugestões proativas se apropriado
    if (proactiveSuggestions.length > 0 && Math.random() < 0.3) { // 30% de chance
        if (!result.suggestions) result.suggestions = [];
        result.suggestions.push(...proactiveSuggestions);

    }
    
    // Atualizar contexto com a resposta
    chatContext.addMessage(message, result.response, bestIntent.confidence);
    
    return result;
}

// Sistema inteligente de análise de intenções
async function analyzeIntent(message, userAccounts, userFixedBills = []) {
    const intents = [];
    const lowerMsg = message.toLowerCase();
    
    // Análise de intenção de criar conta
    if (isCreateAccountIntent(lowerMsg)) {
        const confidence = chatContext.getConfidence(message, 'create_account');
        intents.push({
            type: 'create_account',
            confidence: confidence,
            data: { accountName: extractAccountName(lowerMsg) }
        });
    }
    
    // Análise de intenção de pagamento de conta fixa (DEVE SER VERIFICADO ANTES de despesas genéricas)
    // 🔧 NOVA LÓGICA: Verificação assíncrona para detectar contas fixas registradas
    try {
        if (await isFixedBillPayment(lowerMsg, userFixedBills)) {
            const confidence = 0.85; // Alta confiança para pagamentos de contas fixas
            const paymentInfo = await extractFixedBillPaymentInfo(lowerMsg, userFixedBills);
            intents.push({
                type: 'fixed_bill_payment',
                confidence: confidence,
                data: { ...paymentInfo, originalMessage: message }
            });
        }
    } catch (error) {
        console.error('❌ Erro ao verificar pagamento de conta fixa:', error);
    }
    
    // Análise de intenção de despesa (só se não for conta fixa)
    if (isAddExpenseIntent(lowerMsg)) {
        const confidence = chatContext.getConfidence(message, 'expense');
        const expenseDetails = extractExpenseDetails(message);
        intents.push({
            type: 'add_expense',
            confidence: confidence,
            data: { amount: expenseDetails.amount, description: expenseDetails.description, originalMessage: message }
        });
    }
    
    // Análise de intenção de consulta específica de gastos/receitas por período (DEVE SER VERIFICADO ANTES de receitas genéricas)
    if (isSpecificQueryIntent(lowerMsg)) {
        console.log('🔍 Encontrou intenção de consulta específica:', lowerMsg);
        const confidence = chatContext.getConfidence(message, 'specific_query');
        const { period, startDate, endDate } = extractPeriodFromMessage(lowerMsg);
        const queryType = lowerMsg.includes('gastei') ? 'expense_query' : 'income_query';
        console.log('🔍 Tipo de consulta:', queryType, 'Período:', period);
        intents.push({
            type: queryType,
            confidence: confidence,
            data: { period, startDate, endDate }
        });
    }
    
    // Análise de intenção de receita (só se não for consulta específica)
    if (isAddIncomeIntent(lowerMsg) && !isSpecificQueryIntent(lowerMsg)) {
        const confidence = chatContext.getConfidence(message, 'income');
        const incomeDetails = extractIncomeDetails(message);
        intents.push({
            type: 'add_income',
            confidence: confidence,
            data: { amount: incomeDetails.amount, description: incomeDetails.description, originalMessage: message }
        });
    }
    
    // Análise de intenção de transferência
    if (isTransferIntent(lowerMsg)) {
        const confidence = chatContext.getConfidence(message, 'transfer');
        const { amount, fromAccount, toAccount } = extractTransferDetails(lowerMsg, userAccounts);
        intents.push({
            type: 'perform_transfer',
            confidence: confidence,
            data: { amount, fromAccount, toAccount }
        });
    }
    
    // Análise de intenção de saldo
    if (isShowBalanceIntent(lowerMsg)) {
        const confidence = chatContext.getConfidence(message, 'balance');
        intents.push({
            type: 'show_balance',
            confidence: confidence,
            data: {}
        });
    }
    

    
    // Análise de intenção de consulta de pix por pessoa
    if (isPixQueryIntent(lowerMsg)) {
        const confidence = chatContext.getConfidence(message, 'pix_query');
        const { personName, amount, period } = extractPixQueryDetails(lowerMsg);
        intents.push({
            type: 'pix_query',
            confidence: confidence,
            data: { personName, amount, period }
        });
    }
    
    // Análise de intenção de resumo
    if (isGetSummaryIntent(lowerMsg)) {
        const confidence = chatContext.getConfidence(message, 'summary');
        const { period, startDate, endDate } = extractPeriodFromMessage(lowerMsg);
        intents.push({
            type: 'get_summary',
            confidence: confidence,
            data: { period, startDate, endDate }
        });
    }
    
    // Análise de intenção de ajuda
    if (isShowHelpIntent(lowerMsg)) {
        const confidence = chatContext.getConfidence(message, 'help');
        intents.push({
            type: 'show_help',
            confidence: confidence,
            data: {}
        });
    }
    
    // Análise de intenção de conta fixa mensal
    if (isFixedBillIntent(lowerMsg)) {
        const confidence = chatContext.getConfidence(message, 'fixed_bill');
        const fixedBillDetails = extractFixedBillDetails(lowerMsg);
        intents.push({
            type: 'create_fixed_bill',
            confidence: confidence,
            data: { ...fixedBillDetails, originalMessage: message }
        });
    }
    
    // Análise de intenção de conta recorrente (pagamento)
    if (isRecurringBillIntent(lowerMsg)) {
        const confidence = chatContext.getConfidence(message, 'recurring_bill');
        intents.push({
            type: 'recurring_bill',
            confidence: confidence,
            data: { originalMessage: message }
        });
    }
    
    // Análise de intenção de cumprimento (DEVE SER VERIFICADO ANTES das intenções genéricas)
    if (isGreetingIntent(message)) {
        const confidence = 0.9; // Alta confiança para cumprimentos
        intents.push({
            type: 'greeting',
            confidence: confidence,
            data: { message: message }
        });
    }
    
    // Se não encontrou nenhuma intenção clara, tentar interpretar como despesa genérica
    if (intents.length === 0) {
        console.log('🔍 Nenhuma intenção encontrada, tentando interpretação genérica');
        if (lowerMsg.includes('gastei') || lowerMsg.includes('paguei') || lowerMsg.includes('despesa')) {
            intents.push({
                type: 'add_expense',
                confidence: 0.3,
                data: { amount: null, description: null }
            });
        } else if (lowerMsg.includes('recebi') || lowerMsg.includes('ganhei') || lowerMsg.includes('receita')) {
            intents.push({
                type: 'add_income',
                confidence: 0.3,
                data: { amount: null, description: null }
            });
        }
    }
    
    console.log('🔍 Intenções encontradas:', intents);
    return intents;
}

// Processar intenção selecionada
function processIntent(intent, userAccounts, fixedBills = []) {
    switch (intent.type) {
        case 'create_account':
            return processCreateAccountIntent(intent.data.accountName, userAccounts);
            
        case 'add_expense':
            return processExpenseIntent(intent.data, userAccounts);
            
        case 'add_income':
            return processIncomeIntent(intent.data, userAccounts);
            
        case 'perform_transfer':
            return processTransferIntent(intent.data, userAccounts);
            
        case 'show_balance':
            return processBalanceIntent(userAccounts);
            
        case 'get_summary':
            return processSummaryIntent(intent.data);
            
        case 'expense_query':
            return processExpenseQueryIntent(intent.data);
            
        case 'income_query':
            return processIncomeQueryIntent(intent.data);
            
        case 'pix_query':
            return processPixQueryIntent(intent.data, userAccounts);
            
        case 'show_help':
            return processHelpIntent();
            
        case 'fixed_bill_payment':
            return processFixedBillPaymentIntent(intent.data, userAccounts, fixedBills);
            
        case 'create_fixed_bill':
            return processFixedBillIntent(intent.data, userAccounts);
            
        case 'recurring_bill':
            return processRecurringBillIntent(intent.data.originalMessage, userAccounts, fixedBills);
            
        case 'greeting':
            return processGreetingIntent(intent.data.message);
            
        default:
            return {
                status: 'error',
                response: 'Não consegui entender. Tente algo como:\n• "Gastei R$50 em almoço"\n• "Recebi R$1000 de salário"\n• "Criar conta Nubank"\n• "Transferir R$100 do Itaú para o Nubank"\n• "Qual meu saldo?"\n• "Corrigir última ação"'
            };
    }
}

// Funções de processamento de intenções
function processCreateAccountIntent(accountName, userAccounts) {
    // Verificar se userAccounts é válido
    if (!userAccounts || !Array.isArray(userAccounts)) {
        console.warn('⚠️ userAccounts é inválido em processCreateAccountIntent:', userAccounts);
        // Se não conseguir validar, permitir criação mas com aviso
        if (accountName) {
            return {
                status: 'clarification',
                response: `⚠️ Aviso: Não foi possível validar nomes duplicados.\n\nQual será o saldo inicial da conta "${accountName}"?`,
                pendingAction: {
                    type: 'create_account',
                    accountName: accountName
                }
            };
        } else {
            return {
                status: 'clarification',
                response: '⚠️ Aviso: Não foi possível validar nomes duplicados.\n\nQual será o nome da nova conta?',
                pendingAction: {
                    type: 'create_account',
                    accountName: null
                }
            };
        }
    }
    
    if (accountName) {
        // Validar o nome da conta
        const validation = validateAccountName(accountName, userAccounts);
        if (!validation.isValid) {
            let response = `❌ ${validation.error}`;
            if (validation.suggestion) {
                response += `\n\n💡 **Sugestão:** ${validation.suggestion}`;
            }
    
            return {
                status: 'error',
                response: response
            };
        }
        
        // Verificar se o nome tem espaços e sugerir usar aspas
        let response = `Qual será o saldo inicial da conta "${accountName}"?`;
        if (accountName.includes(' ') && !accountName.includes('"') && !accountName.includes("'")) {

        }
        
        return {
            status: 'clarification',
            response: response,
            pendingAction: {
                type: 'create_account',
                accountName: accountName
            }
        };
    } else {
        return {
            status: 'clarification',
            response: 'Qual será o nome da nova conta?',
            pendingAction: {
                type: 'create_account',
                accountName: null
            }
        };
    }
}

// Função para processar pagamento de conta fixa
function processFixedBillPaymentIntent(data, userAccounts, fixedBills = []) {
    console.log('💰 Processando pagamento de conta fixa:', data);
    console.log('🔍 Contas fixas disponíveis:', fixedBills);
    
    if (!data.bill) {
        return {
            status: 'error',
            response: 'Não consegui identificar qual conta fixa foi paga. Pode ser mais específico?'
        };
    }
    
    const bill = data.bill;
    const amount = data.amount;
    const bank = data.bank;
    
    // 🔧 CORREÇÃO CRÍTICA: Buscar conta fixa real do banco de dados
    let realBill = null;
    if (fixedBills && fixedBills.length > 0) {
        console.log('🔍 Buscando conta fixa no banco com nome:', bill.name);
        
        // Buscar por nome exato primeiro
        realBill = fixedBills.find(fb => fb.name.toLowerCase() === bill.name.toLowerCase());
        
        // Se não encontrar, buscar por similaridade
        if (!realBill) {
            realBill = fixedBills.find(fb => 
                fb.name.toLowerCase().includes(bill.name.toLowerCase()) || 
                bill.name.toLowerCase().includes(fb.name.toLowerCase())
            );
        }
        
        // Se ainda não encontrar, buscar por sinônimos
        if (!realBill) {
            for (const fb of fixedBills) {
                if (FIXED_BILLS_KNOWLEDGE[fb.name] && FIXED_BILLS_KNOWLEDGE[fb.name].synonyms) {
                    for (const synonym of FIXED_BILLS_KNOWLEDGE[fb.name].synonyms) {
                        if (bill.name.toLowerCase().includes(synonym.toLowerCase()) || 
                            synonym.toLowerCase().includes(bill.name.toLowerCase())) {
                            realBill = fb;
                            console.log('🔍 Conta fixa encontrada via sinônimo:', fb.name);
                            break;
                        }
                    }
                    if (realBill) break;
                }
            }
        }
    }
    
    console.log('🔍 Conta fixa encontrada no banco:', realBill);
    
    // 🔧 CORREÇÃO CRÍTICA: Verificar saldo antes de confirmar pagamento
    const finalAmount = realBill ? realBill.amount : amount;
    
    if (!finalAmount || finalAmount <= 0) {
        return {
            status: 'error',
            response: `❌ Erro: Valor da conta fixa "${bill.name}" não foi definido corretamente. Valor detectado: R$ ${finalAmount.toFixed(2)}.\n\n💡 **Para corrigir:**\n• Verifique se a conta fixa foi cadastrada com valor correto\n• Use o painel de contas fixas para definir o valor\n• Tente: "paguei R$ 100 do aluguel"`
        };
    }
    
    // Verificar se há alguma conta com saldo suficiente
    const accountsWithSufficientBalance = userAccounts.filter(acc => acc && acc.name && acc.id && (acc.balance || 0) >= finalAmount);
    
    if (accountsWithSufficientBalance.length === 0) {
        // Nenhuma conta tem saldo suficiente
        return {
            status: 'error',
            response: `❌ Nenhuma conta tem saldo suficiente para pagar ${bill.name} (R$ ${finalAmount.toFixed(2)}).\n\n💡 **Sugestões:**\n• Adicione dinheiro a uma das suas contas\n• Reduza o valor da conta fixa\n• Use uma transferência de outra conta primeiro\n\n💰 **Seus saldos atuais:**\n${userAccounts.filter(acc => acc && acc.name && acc.id).map(acc => `• ${acc.name}: R$ ${(acc.balance || 0).toFixed(2)}`).join('\n')}`
        };
    }
    
    // Há saldo suficiente, confirmar pagamento
    let response = `✅ Perfeito! Registrei o pagamento da conta fixa "${bill.name}". `;
    
    if (amount) {
        response += `Valor: R$ ${amount.toFixed(2)}. `;
    } else if (realBill && realBill.amount) {
        response += `Valor: R$ ${realBill.amount.toFixed(2)}. `;
    } else {
        response += `Valor: R$ ${finalAmount.toFixed(2)}. `;
    }
    
    if (bank) {
        response += `Banco usado: ${bank.name}. `;
    } else {
        response += `Qual conta você usou para pagar? `;
    }
    
    response += `\n\nAgora preciso saber: qual conta você usou para fazer o pagamento?`;
    
    // 🔧 CORREÇÃO: Passar dados da conta fixa real para validação
    const finalData = {
        ...data,
        bill: realBill || bill, // Usar conta real se disponível
        realAmount: finalAmount
    };
    
    return {
        status: 'success',
        response: response,
        action: 'fixed_bill_payment',
        data: finalData,
        requiresAccountSelection: !bank
    };
}

// Função para processar intenção de conta fixa mensal
function processFixedBillIntent(data, userAccounts) {
    const { name, amount, dueDay, frequency, category, originalMessage } = data;
    
    // Verificar se temos informações suficientes
    if (!name) {
        return {
            status: 'clarification',
            response: 'Qual é o nome da conta fixa? Por exemplo: "aluguel", "internet", "energia"',
            pendingAction: {
                type: 'create_fixed_bill',
                name: null,
                amount: amount,
                dueDay: dueDay,
                frequency: frequency,
                category: category
            }
        };
    }
    
    if (!amount) {
        return {
            status: 'clarification',
            response: `Qual é o valor da conta fixa "${name}"?`,
            pendingAction: {
                type: 'create_fixed_bill',
                name: name,
                amount: null,
                dueDay: dueDay,
                frequency: frequency,
                category: category
            }
        };
    }
    
    // Se temos nome e valor, mas não temos dia de vencimento
    if (!dueDay) {
        // Para contas comuns, sugerir dias padrão
        let suggestedDay = 10; // Dia padrão
        let suggestion = '';
        
        if (['aluguel', 'condomínio'].includes(name.toLowerCase())) {
            suggestedDay = 10;
            suggestion = `💡 Para ${name}, o dia 10 é comum. `;
        } else if (['energia', 'água', 'gás'].includes(name.toLowerCase())) {
            suggestedDay = 15;
            suggestion = `💡 Para ${name}, o dia 15 é comum. `;
        } else if (['internet', 'telefone', 'celular'].includes(name.toLowerCase())) {
            suggestedDay = 20;
            suggestion = `💡 Para ${name}, o dia 20 é comum. `;
        }
        
        return {
            status: 'clarification',
            response: `${suggestion}Em que dia do mês vence a conta "${name}" de R$ ${amount.toFixed(2)}?`,
            pendingAction: {
                type: 'create_fixed_bill',
                name: name,
                amount: amount,
                dueDay: null,
                frequency: frequency,
                category: category
            }
        };
    }
    
    // Se temos todas as informações, criar a conta fixa
    const fixedBillData = {
        name: name,
        amount: amount,
        dueDay: dueDay,
        frequency: frequency,
        category: category,
        isActive: true,
        createdAt: new Date(),
        lastProcessed: null
    };
    
    return {
        status: 'success',
        action: 'create_fixed_bill',
        data: fixedBillData,
        response: `✅ Conta fixa mensal criada com sucesso!\n\n📋 **${name}**\n💰 Valor: R$ ${amount.toFixed(2)}\n📅 Vencimento: Dia ${dueDay} de cada mês\n🏷️ Categoria: ${getCategoryDisplayName(category)}\n\n💡 Esta conta será processada automaticamente todo mês no dia ${dueDay}.`
    };
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
        'other': 'Outros'
    };
    
    return categoryNames[category] || category;
}

function processExpenseIntent(data, userAccounts) {
    const { amount, description, dateInfo } = data;
    
    // Verificar se userAccounts é válido
    if (!userAccounts || !Array.isArray(userAccounts)) {
        console.warn('⚠️ userAccounts é inválido em processExpenseIntent:', userAccounts);
        return {
            status: 'error',
            response: 'Erro interno: contas não disponíveis. Tente recarregar a página.'
        };
    }
    
    if (amount && description) {
        // Tentar identificar a conta automaticamente usando a nova função inteligente
        const accountResult = identifyAccountForTransaction(data.originalMessage || '', userAccounts, 'expense');
        
        if (accountResult.status === 'success') {
            // Verificar se é uma data passada e precisa de horário
            if (dateInfo && (dateInfo.type === 'yesterday' || dateInfo.type === 'past_date')) {
                return {
                    status: 'clarification',
                    response: `Você informou que fez o pagamento ${dateInfo.message}. Qual foi o horário? 💡 Formato: "18:00", "18 horas", "18", "18,00"`,
                    pendingAction: {
                        type: 'add_expense_with_time',
                        amount: amount,
                        description: description,
                        accountId: accountResult.accountId,
                        dateInfo: dateInfo
                    }
                };
            }
            
            const pendingAction = {
                type: 'add_expense',
                amount: amount,
                description: description,
                accountId: accountResult.accountId,
                dateInfo: dateInfo
            };
            
            // Verificar se precisa de confirmação
            if (amount > CONFIRMATION_LIMIT) {
                const accountName = userAccounts.find(acc => acc.id === accountResult.accountId)?.name || 'conta';
                return {
                    status: 'confirmation',
                    response: `Confirma a despesa de R$ ${amount.toFixed(2)} em "${description}" na conta ${accountName}?`,
                    pendingAction: pendingAction
                };
            }
            
            return {
                status: 'success',
                action: 'add_transaction',
                data: {
                    type: 'expense',
                    amount: amount,
                    description: description,
                    accountId: accountResult.accountId,
                    timestamp: dateInfo ? dateInfo.date : new Date() // Usar data informada ou atual
                },
                response: `✅ Despesa registrada: ${description} - R$ ${amount.toFixed(2)} na conta ${userAccounts.find(acc => acc.id === accountResult.accountId)?.name || 'principal'}`
            };
        } else if (accountResult.status === 'clarification') {
            // Se precisa de esclarecimento sobre a conta
            return {
                status: 'clarification',
                response: accountResult.message || `Em qual conta você gastou R$ ${amount.toFixed(2)}?`,
                options: accountResult.options,
                pendingAction: {
                    type: 'add_expense',
                    amount: amount,
                    description: description,
                    accountId: null
                }
            };
        } else {
            // Erro na identificação da conta
            return {
                status: 'error',
                response: accountResult.message || 'Erro ao identificar a conta. Tente novamente.'
            };
        }
    } else if (amount) {
        return {
            status: 'clarification',
            response: `Com o que você gastou R$ ${amount.toFixed(2)}?`,
            pendingAction: {
                type: 'add_expense',
                amount: amount,
                description: null,
                accountId: null
            }
        };
    } else {
        return {
            status: 'clarification',
            response: 'Quanto você gastou? Por exemplo: "Gastei R$25 em almoço"',
            pendingAction: {
                type: 'add_expense',
                amount: null,
                description: null,
                accountId: null
            }
        };
    }
}

function processIncomeIntent(data, userAccounts) {
    const { amount, description, dateInfo } = data;
    
    // Verificar se userAccounts é válido
    if (!userAccounts || !Array.isArray(userAccounts)) {
        console.warn('⚠️ userAccounts é inválido em processIncomeIntent:', userAccounts);
        return {
            status: 'error',
            response: 'Erro interno: contas não disponíveis. Tente recarregar a página.'
        };
    }
    
    if (amount && description) {
        // Tentar identificar a conta automaticamente usando a nova função inteligente
        const accountResult = identifyAccountForTransaction(data.originalMessage || '', userAccounts, 'income');
        
        if (accountResult.status === 'success') {
            // Verificar se é uma data passada e precisa de horário
            if (dateInfo && (dateInfo.type === 'yesterday' || dateInfo.type === 'past_date')) {
                return {
                    status: 'clarification',
                    response: `Você informou que recebeu ${dateInfo.message}. Qual foi o horário? 💡 Formato: "18:00", "18 horas", "18", "18,00"`,
                    pendingAction: {
                        type: 'add_income_with_time',
                        amount: amount,
                        description: description,
                        accountId: accountResult.accountId,
                        dateInfo: dateInfo
                    }
                };
            }
            
            const pendingAction = {
                type: 'add_income',
                amount: amount,
                description: description,
                accountId: accountResult.accountId,
                dateInfo: dateInfo
            };
            
            // Verificar se precisa de confirmação
            if (amount > CONFIRMATION_LIMIT) {
                const accountName = userAccounts.find(acc => acc.id === accountResult.accountId)?.name || 'conta';
                return {
                    status: 'confirmation',
                    response: `Confirma a receita de R$ ${amount.toFixed(2)} em "${description}" na conta ${accountName}?`,
                    pendingAction: pendingAction
                };
            }
            
            return {
                status: 'success',
                action: 'add_transaction',
                data: {
                    type: 'income',
                    amount: amount,
                    description: description,
                    accountId: accountResult.accountId,
                    timestamp: dateInfo ? dateInfo.date : new Date() // Usar data informada ou atual
                },
                response: `✅ Receita registrada: ${description} - R$ ${amount.toFixed(2)} na conta ${userAccounts.find(acc => acc.id === accountResult.accountId)?.name || 'principal'}`
            };
        } else if (accountResult.status === 'clarification') {
            // Se precisa de esclarecimento sobre a conta
            return {
                status: 'clarification',
                response: accountResult.message || `Em qual conta você recebeu R$ ${amount.toFixed(2)}?`,
                options: accountResult.options,
                pendingAction: {
                    type: 'add_income',
                    amount: amount,
                    description: description,
                    accountId: null
                }
            };
        } else {
            // Erro na identificação da conta
            return {
                status: 'error',
                response: accountResult.message || 'Erro ao identificar a conta. Tente novamente.'
            };
        }
    } else if (amount) {
        // Se só tem o valor, perguntar pela descrição primeiro
        return {
            status: 'clarification',
            response: `De onde você recebeu R$ ${amount.toFixed(2)}?`,
            pendingAction: {
                type: 'add_income',
                amount: amount,
                description: null,
                accountId: null
            }
        };
    } else {
        return {
            status: 'clarification',
            response: 'Quanto você recebeu? Por exemplo: "Recebi R$1000 de salário"',
            pendingAction: {
                type: 'add_income',
                amount: null,
                description: null,
                accountId: null
            }
        };
    }
}

function processPixQueryIntent(data, userAccounts) {
    const { personName, amount, period } = data;
    
    if (!personName) {
        return {
            status: 'error',
            response: 'Não consegui identificar para quem você enviou o pix. Tente ser mais específico.'
        };
    }
    
    // Aqui você implementaria a lógica para buscar no banco de dados
    // Por enquanto, vou retornar uma resposta simulada
    let response = `🔍 Consultando pix enviados para ${personName}`;
    
    if (amount) {
        response += ` no valor de R$ ${amount.toFixed(2)}`;
    }
    
    if (period === 'today') {
        response += ' hoje';
    } else if (period === 'yesterday') {
        response += ' ontem';
    } else if (period === 'week') {
        response += ' nesta semana';
    } else if (period === 'month') {
        response += ' neste mês';
    }
    
    response += '...\n\n';
    
    // Simular resultado (aqui você implementaria a busca real)
    if (amount) {
        response += `✅ Encontrei 1 pix de R$ ${amount.toFixed(2)} para ${personName} hoje às 14:30`;
    } else {
        response += `✅ Encontrei 3 pix para ${personName}:\n`;
        response += `• R$ 50,00 hoje às 10:15\n`;
        response += `• R$ 25,00 ontem às 16:45\n`;
        response += `• R$ 100,00 na semana passada`;
    }
    
    return {
        status: 'success',
        response: response
    };
}

function processTransferIntent(data, userAccounts) {
    const { amount, fromAccount, toAccount, dateInfo } = data;
    
    // Verificar se userAccounts é válido
    if (!userAccounts || !Array.isArray(userAccounts)) {
        console.warn('⚠️ userAccounts é inválido em processTransferIntent:', userAccounts);
        return {
            status: 'error',
            response: 'Erro interno: contas não disponíveis. Tente recarregar a página.'
        };
    }
    
    if (amount && fromAccount && toAccount) {
        // Verificar se é uma data passada e precisa de horário
        if (dateInfo && (dateInfo.type === 'yesterday' || dateInfo.type === 'past_date')) {
            return {
                status: 'clarification',
                response: `Você informou que fez a transferência ${dateInfo.message}. Qual foi o horário? 💡 Formato: "18:00", "18 horas", "18", "18,00"`,
                pendingAction: {
                    type: 'perform_transfer_with_time',
                    amount: amount,
                    fromAccountId: fromAccount.id,
                    toAccountId: toAccount.id,
                    dateInfo: dateInfo
                }
            };
        }
        
        const pendingAction = {
            type: 'perform_transfer',
            amount: amount,
            fromAccountId: fromAccount.id,
            toAccountId: toAccount.id,
            dateInfo: dateInfo
        };
        
        // Verificar se precisa de confirmação
        if (amount > CONFIRMATION_LIMIT) {
            return {
                status: 'confirmation',
                response: `Confirma a transferência de R$ ${amount.toFixed(2)} de ${fromAccount.name} para ${toAccount.name}?`,
                pendingAction: pendingAction
            };
        }
        
        return {
            status: 'success',
            action: 'perform_transfer',
            data: {
                fromAccountId: fromAccount.id,
                toAccountId: toAccount.id,
                amount: amount,
                timestamp: dateInfo ? dateInfo.date : new Date() // Usar data informada ou atual
            },
            response: `✅ Transferência realizada: R$ ${amount.toFixed(2)} de ${fromAccount.name} para ${toAccount.name}`
        };
    } else {
        return {
            status: 'clarification',
            response: 'De qual conta para qual conta você quer transferir? Por exemplo: "Transferir R$100 do Itaú para o Nubank"',
            pendingAction: {
                type: 'perform_transfer',
                amount: amount || null,
                fromAccountId: null,
                toAccountId: null
            }
        };
    }
}

function processBalanceIntent(userAccounts) {
    // Verificar se userAccounts é válido
    if (!userAccounts || !Array.isArray(userAccounts)) {
        console.warn('⚠️ userAccounts é inválido em processBalanceIntent:', userAccounts);
        return {
            status: 'error',
            response: 'Erro interno: contas não disponíveis. Tente recarregar a página.'
        };
    }
    
    if (userAccounts.length === 0) {
        return {
            status: 'success',
            action: 'show_balance',
            response: 'Você ainda não tem contas cadastradas. Crie uma conta primeiro!'
        };
    }
    
    let response = '💰 Seu saldo total é R$ ' + userAccounts.reduce((total, acc) => total + (acc && acc.balance ? acc.balance : 0), 0).toFixed(2) + '\n\n';
    userAccounts.forEach(account => {
        if (account && account.name && account.balance !== undefined) {
            response += `${account.name}: R$ ${account.balance.toFixed(2)}\n`;
        }
    });
    
    return {
        status: 'success',
        action: 'show_balance',
        response: response
    };
}

function processSummaryIntent(data) {
    const { period, startDate, endDate } = data;
    
    if (period && startDate && endDate) {
        return {
            status: 'success',
            action: 'get_summary',
            data: {
                period: period,
                startDate: startDate,
                endDate: endDate,
                useIntelligentSummary: true // 🚀 NOVO: Usar resumo inteligente
            },
            response: '' // Não exibir mensagem redundante
        };
    } else {
        // Se não especificou período, assumir mês atual por padrão
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);
        
        return {
            status: 'success',
            action: 'get_summary',
            data: {
                period: 'este mês',
                startDate: startOfMonth,
                endDate: endOfMonth,
                useIntelligentSummary: true // 🚀 NOVO: Usar resumo inteligente
            },
            response: '' // Não exibir mensagem redundante
        };
    }
}

function processExpenseQueryIntent(data) {
    const { period, startDate, endDate } = data;
    
    return {
        status: 'success',
        action: 'get_expense_query',
        data: {
            period: period,
            startDate: startDate,
            endDate: endDate
        },
        response: '' // Não exibir mensagem redundante
    };
}

function processIncomeQueryIntent(data) {
    const { period, startDate, endDate } = data;
    
    return {
        status: 'success',
        action: 'get_income_query',
        data: {
            period: period,
            startDate: startDate,
            endDate: endDate
        },
        response: '' // Não exibir mensagem redundante
    };
}

function processGreetingIntent(message) {
    const lowerMsg = message.toLowerCase().trim();
    
    // Respostas personalizadas baseadas no tipo de cumprimento
    let response = '';
    
    if (lowerMsg.includes('bom dia')) {
        response = 'Bom dia! ☀️ Como posso ajudar com suas finanças hoje?';
    } else if (lowerMsg.includes('boa tarde')) {
        response = 'Boa tarde! 🌤️ Como posso ajudar com suas finanças hoje?';
    } else if (lowerMsg.includes('boa noite')) {
        response = 'Boa noite! 🌙 Como posso ajudar com suas finanças hoje?';
    } else if (lowerMsg.includes('oi') || lowerMsg.includes('olá') || lowerMsg.includes('ola') || lowerMsg.includes('ei') || lowerMsg.includes('hey') || lowerMsg.includes('hello') || lowerMsg.includes('hi')) {
        response = 'Olá! 👋 Como posso ajudar com suas finanças hoje?';
    } else {
        response = 'Olá! 👋 Como posso ajudar com suas finanças hoje?';
    }
    
    return {
        status: 'success',
        action: 'greeting',
        response: response
    };
}

function processHelpIntent() {
    return {
        status: 'success',
        action: 'show_help',
        response: `🤖 **Como usar o Dinah:**

💰 **Consultas:**
• "Qual meu saldo?" - Ver saldo de todas as contas
• "Quanto tenho?" - Saldo total
• "Quanto gastei este mês?" - Resumo mensal
• "Quanto gastei ontem?" - Gastos de ontem
• "Quanto recebi ontem?" - Receitas de ontem

💸 **Registrar despesas:**
• "Gastei R$50 em almoço"
• "Paguei R$200 de conta"

💵 **Registrar receitas:**
• "Recebi R$1000 de salário"
• "Ganhei R$500 de freela"

🏦 **Contas:**
• "Criar conta Nubank" - Nova conta
• "Transferir R$100 do Itaú para o Nubank"

🔄 **Correções:**
• "Corrigir última ação" - Corrigir erro
• "Desfazer" - Cancelar transação

`
    };
}

// Funções auxiliares para reconhecimento de intenções
function isCreateAccountIntent(message) {
    // Palavras-chave corretas para criar conta
    const correctCreateAccountWords = [
        'criar', 'nova', 'adicionar', 'adiciona', 'cria', 'novo', 'adicionando',
        'criando', 'adicionou', 'criou'
    ];
    
    // Frases-chave corretas para criar conta
    const correctCreateAccountPhrases = [
        'criar conta', 'nova conta', 'adicionar conta', 'criar uma conta',
        'nova conta bancaria', 'adicionar uma conta', 'criar conta nova'
    ];
    
    // Dividir a mensagem em palavras
    const words = message.toLowerCase().split(/\s+/);
    
    // Verificar se alguma palavra está próxima de uma palavra-chave
    for (const word of words) {
        if (isCloseToCorrect(word, correctCreateAccountWords, 0.6)) {
            const correctedWord = correctTypo(word, correctCreateAccountWords, 0.6);
            console.log(`🔍 Palavra com erro de digitação detectada: "${word}" -> "${correctedWord}"`);
            // Se encontrou uma palavra-chave, verificar se também tem "conta" na mensagem
            if (message.toLowerCase().includes('conta')) {
                return true;
            }
        }
    }
    
    // Se não encontrou com tolerância, verificar com método original
    return message.includes('criar conta') || message.includes('nova conta') || message.includes('adicionar conta');
}

// Função para verificar se uma mensagem é sobre conta fixa mensal
function isFixedBillIntent(message) {
    const lowerMsg = message.toLowerCase();
    
    // Palavras-chave específicas para contas fixas
    const fixedBillKeywords = [
        'aluguel', 'conta', 'fixa', 'mensal', 'todo mês', 'mensalmente', 'recorrente',
        'condomínio', 'internet', 'energia', 'água', 'gás', 'telefone', 'celular',
        'assinatura', 'netflix', 'spotify', 'prime', 'disney', 'hbo', 'youtube'
    ];
    
    // Verificar se contém palavras-chave de conta fixa
    for (const keyword of fixedBillKeywords) {
        if (lowerMsg.includes(keyword)) {
            return true;
        }
    }
    
    // Verificar se contém padrões de valor + frequência
    const valuePattern = /\d+[.,]?\d*\s*(reais?|r\$|real)/i;
    const frequencyPattern = /(todo mês|mensalmente|dia \d+|todo dia \d+)/i;
    
    if (valuePattern.test(lowerMsg) && frequencyPattern.test(lowerMsg)) {
        return true;
    }
    
    // Verificar se contém apenas o nome de uma conta fixa comum
    const commonFixedBills = ['aluguel', 'condomínio', 'internet', 'energia', 'água'];
    for (const bill of commonFixedBills) {
        if (lowerMsg.trim() === bill) {
            return true;
        }
    }
    
    return false;
}

// Função para verificar se uma mensagem é um cumprimento
function isGreetingIntent(message) {
    const greetingWords = [
        'oi', 'olá', 'ola', 'ei', 'hey', 'hello', 'hi', 'bom dia', 'boa tarde', 'boa noite',
        'oi!', 'olá!', 'ola!', 'ei!', 'hey!', 'hello!', 'hi!', 'bom dia!', 'boa tarde!', 'boa noite!'
    ];
    
    const lowerMsg = message.toLowerCase().trim();
    
    // Verificar se é apenas um cumprimento (sem outras palavras)
    for (const greeting of greetingWords) {
        if (lowerMsg === greeting || lowerMsg === greeting.replace('!', '')) {
            return true;
        }
    }
    
    // Verificar se começa com cumprimento mas tem outras palavras
    for (const greeting of greetingWords) {
        if (lowerMsg.startsWith(greeting + ' ') || lowerMsg.startsWith(greeting.replace('!', '') + ' ')) {
            return true;
        }
    }
    
    return false;
}

function isAddExpenseIntent(message) {
    // PRIMEIRO: Verificar se é uma transferência entre contas próprias
    if (isTransferBetweenOwnAccounts(message)) {
        console.log('🔍 Detectado como transferência entre contas próprias, não como despesa');
        return false;
    }
    
    // Palavras-chave corretas para despesa
    const correctExpenseWords = [
        'gastei', 'paguei', 'despesa', 'comprei', 'gasto', 'gastando', 'pagando',
        'despesas', 'gastos', 'compras', 'pago', 'gastou', 'pagou', 'pix', 'fiz pix',
        'enviei pix', 'enviando pix', 'enviado pix', 'mandar pix', 'mandei pix',
        'mandando pix', 'paguei pix', 'pix de', 'pix para'
    ];
    
    // Dividir a mensagem em palavras
    const words = message.toLowerCase().split(/\s+/);
    
    // Verificar se alguma palavra está próxima de uma palavra-chave de despesa
    for (const word of words) {
        if (isCloseToCorrect(word, correctExpenseWords, 0.6)) {
            const correctedWord = correctTypo(word, correctExpenseWords, 0.6);
            console.log(`🔍 Palavra com erro de digitação detectada: "${word}" -> "${correctedWord}"`);
            return true;
        }
    }
    
    // Se não encontrou com tolerância, verificar com método original
    return message.includes('gastei') || message.includes('paguei') || message.includes('despesa') || 
           message.includes('comprei') || message.includes('gasto');
}

// Nova função para detectar transferências entre contas próprias
function isTransferBetweenOwnAccounts(message) {
    const lowerMsg = message.toLowerCase();
    
    // Palavras que indicam transferência/movimentação entre contas
    const transferKeywords = [
        'mandei', 'mandando', 'mandar', 'enviando', 'enviado', 'enviei', 'transfiri', 'transferindo',
        'transferir', 'movi', 'movendo', 'mover', 'passei', 'passando', 'passar', 'de', 'para', 'pra'
    ];
    
    // Verificar se contém palavras de transferência
    let hasTransferKeyword = false;
    for (const keyword of transferKeywords) {
        if (lowerMsg.includes(keyword)) {
            hasTransferKeyword = true;
            break;
        }
    }
    
    if (!hasTransferKeyword) {
        return false;
    }
    
    // Verificar se contém padrões de direção (de X para Y)
    const directionPatterns = [
        /(?:de|da|do)\s+.+?\s+(?:para|pra)/i,  // "de nubank para nubank empresarial"
        /(?:para|pra)\s+.+?\s+(?:de|da|do)/i,  // "para nubank empresarial de nubank"
        /(?:mandei|enviei|transfiri|movi)\s+.+?\s+(?:de|da|do)\s+.+?\s+(?:para|pra)/i, // "mandei 100 de nubank para nubank empresarial"
        /(?:mandei|enviei|transfiri|movi)\s+.+?\s+(?:para|pra)\s+.+?\s+(?:de|da|do)/i  // "mandei 100 para nubank empresarial de nubank"
    ];
    
    for (const pattern of directionPatterns) {
        if (pattern.test(lowerMsg)) {
            console.log('🔍 Padrão de direção encontrado, é transferência entre contas');
            return true;
        }
    }
    
    // Verificar se contém valor monetário + palavras de transferência
    const hasAmount = /\d+[.,]?\d*/.test(lowerMsg);
    if (hasAmount && hasTransferKeyword) {
        // Verificar se não é um gasto real (ex: "mandei 100 reais para pagar conta")
        const expenseIndicators = ['pagar', 'conta', 'boleto', 'fatura', 'compra', 'almoço', 'uber', 'ifood'];
        for (const indicator of expenseIndicators) {
            if (lowerMsg.includes(indicator)) {
                console.log('🔍 Contém indicador de gasto real, não é transferência');
                return false;
            }
        }
        
        console.log('🔍 Contém valor + palavra de transferência, provavelmente é transferência entre contas');
        return true;
    }
    
    return false;
}

function isAddIncomeIntent(message) {
    // Palavras-chave corretas para receita
    const correctIncomeWords = [
        'recebi', 'ganhei', 'receita', 'salário', 'freela', 'recebendo', 'ganhando',
        'receitas', 'ganhos', 'salarios', 'freelas', 'recebeu', 'ganhou'
    ];
    
    // Dividir a mensagem em palavras
    const words = message.toLowerCase().split(/\s+/);
    
    // Verificar se alguma palavra está próxima de uma palavra-chave de receita
    for (const word of words) {
        if (isCloseToCorrect(word, correctIncomeWords, 0.6)) {
            const correctedWord = correctTypo(word, correctIncomeWords, 0.6);
            console.log(`🔍 Palavra com erro de digitação detectada: "${word}" -> "${correctedWord}"`);
            return true;
        }
    }
    
    // Se não encontrou com tolerância, verificar com método original
    return message.includes('recebi') || message.includes('ganhei') || message.includes('receita') || 
           message.includes('salário') || message.includes('freela');
}

function isTransferIntent(message) {
    // PRIMEIRO: Verificar se é uma transferência entre contas próprias usando a função melhorada
    if (isTransferBetweenOwnAccounts(message)) {
        console.log('🔍 Detectado como transferência entre contas próprias');
        return true;
    }
    
    // Palavras-chave corretas para transferência
    const correctTransferWords = [
        'transferir', 'transferi', 'mover', 'movi', 'transfira', 'transfere',
        'transferência', 'transferencia', 'transferindo', 'transferido'
    ];
    
    // Dividir a mensagem em palavras
    const words = message.toLowerCase().split(/\s+/);
    
    // Verificar se alguma palavra está próxima de uma palavra-chave de transferência
    let hasTransferKeyword = false;
    let correctedWord = null;
    
    for (const word of words) {
        if (isCloseToCorrect(word, correctTransferWords, 0.6)) {
            hasTransferKeyword = true;
            correctedWord = correctTypo(word, correctTransferWords, 0.6);
            console.log(`🔍 Palavra com erro de digitação detectada: "${word}" -> "${correctedWord}"`);
            break;
        }
    }
    
    // Se não encontrou com tolerância, verificar com padrões regex (método original)
    if (!hasTransferKeyword) {
        const transferPatterns = [
            /transferir/i,
            /transferi/i,
            /mover/i,
            /movi/i,
            /transfira/i,
            /transfere/i
        ];
        hasTransferKeyword = transferPatterns.some(pattern => pattern.test(message));
    }
    
    // Verificar se contém o padrão "de X para Y" (incluindo "da", "do")
    const hasDeParaPattern = /(?:de|da|do)\s+.+?\s+(?:para|pra)/i.test(message);
    
    // Verificar se contém valor monetário
    const hasAmount = /\d+[.,]?\d*/.test(message);
    
    // Para ser uma transferência, deve ter pelo menos uma palavra-chave E o padrão de direção
    return hasTransferKeyword && hasDeParaPattern && hasAmount;
}

function isPixQueryIntent(message) {
    const lowerMsg = message.toLowerCase();
    
    // Verificar se é uma consulta sobre pix
    const hasPixKeyword = lowerMsg.includes('pix') || lowerMsg.includes('enviei') || lowerMsg.includes('enviado');
    
    // Verificar se contém palavras de consulta
    const hasQueryKeywords = lowerMsg.includes('?') || 
                           lowerMsg.includes('quanto') || 
                           lowerMsg.includes('quando') || 
                           lowerMsg.includes('hoje') || 
                           lowerMsg.includes('ontem') ||
                           lowerMsg.includes('enviei') ||
                           lowerMsg.includes('enviado');
    
    // Verificar se menciona uma pessoa (para, pra, com)
    const hasPersonMention = /(?:para|pra|com)\s+[a-záàâãéèêíìîóòôõúùûç\s]+/i.test(message);
    
    return hasPixKeyword && hasQueryKeywords && hasPersonMention;
}

function isShowBalanceIntent(message) {
    // Palavras-chave corretas para saldo
    const correctBalanceWords = [
        'saldo', 'quanto', 'tenho', 'meu', 'minha', 'qual', 'quanto tenho',
        'meu saldo', 'minha conta', 'quanto eu tenho', 'saldo da conta'
    ];
    
    // Dividir a mensagem em palavras
    const words = message.toLowerCase().split(/\s+/);
    
    // Verificar se alguma palavra está próxima de uma palavra-chave de saldo
    for (const word of words) {
        if (isCloseToCorrect(word, correctBalanceWords, 0.6)) {
            const correctedWord = correctTypo(word, correctBalanceWords, 0.6);
            console.log(`🔍 Palavra com erro de digitação detectada: "${word}" -> "${correctedWord}"`);
            // Se encontrou uma palavra-chave, verificar se não é consulta de total
            if (!message.toLowerCase().includes('total')) {
                return true;
            }
        }
    }
    
    // Se não encontrou com tolerância, verificar com método original
    return message.includes('qual meu saldo') || message.includes('quanto tenho') || message.includes('meu saldo') ||
           message.includes('saldo') && !message.includes('total');
}

function isShowTotalBalanceIntent(message) {
    return message.includes('quanto tenho') || message.includes('saldo total') || message.includes('total');
}

function isGetSummaryIntent(message) {
    // Palavras-chave corretas para resumo
    const correctSummaryWords = [
        'resumo', 'resumir', 'resumindo', 'resumiu', 'resumido', 'resumos',
        'relatório', 'relatorio', 'relatórios', 'relatorios', 'balanço', 'balanco',
        'historico', 'histórico', 'relatorio completo', 'resumo melhorado', 'historico detalhado'
    ];
    
    // Períodos corretos
    const correctPeriodWords = [
        'este mês', 'este mes', 'última semana', 'ultima semana', 'mês passado', 'mes passado',
        'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto',
        'setembro', 'outubro', 'novembro', 'dezembro'
    ];
    
    // Remover palavras-chave que conflitam com consultas específicas
    if (message.includes('quanto gastei') || message.includes('quanto recebi') || message.includes('quanto ganhei')) {
        return false;
    }
    
    // Dividir a mensagem em palavras
    const words = message.toLowerCase().split(/\s+/);
    
    // Verificar se alguma palavra está próxima de uma palavra-chave de resumo
    for (const word of words) {
        if (isCloseToCorrect(word, correctSummaryWords, 0.6)) {
            const correctedWord = correctTypo(word, correctSummaryWords, 0.6);
            console.log(`🔍 Palavra com erro de digitação detectada: "${word}" -> "${correctedWord}"`);
            return true;
        }
    }
    
    // Verificar se alguma palavra está próxima de um período
    for (const word of words) {
        if (isCloseToCorrect(word, correctPeriodWords, 0.6)) {
            const correctedWord = correctTypo(word, correctPeriodWords, 0.6);
            console.log(`🔍 Palavra com erro de digitação detectada: "${word}" -> "${correctedWord}"`);
            return true;
        }
    }
    
    // Se não encontrou com tolerância, verificar com método original
    return message.includes('resumo') || message.includes('historico') || message.includes('histórico') || 
           message.includes('relatorio') || message.includes('relatório') || message.includes('este mês') || 
           message.includes('última semana') || message.includes('janeiro') || message.includes('fevereiro') || 
           message.includes('março') || message.includes('abril') || message.includes('maio') || 
           message.includes('junho') || message.includes('julho') || message.includes('agosto') || 
           message.includes('setembro') || message.includes('outubro') || message.includes('novembro') || 
           message.includes('dezembro');
}

function isSpecificQueryIntent(message) {
    const lowerMsg = message.toLowerCase();
    
    // Palavras-chave corretas para consultas específicas
    const correctQueryWords = [
        'quanto', 'quanto gastei', 'quanto recebi', 'quanto ganhei', 'quanto eu gastei',
        'quanto eu recebi', 'quanto eu ganhei', 'quanto foi', 'quanto custou', 'quantos', 'quantas'
    ];
    
    // Períodos corretos
    const correctPeriodWords = [
        'ontem', 'hoje', 'esta semana', 'este mês', 'este mes', 'última semana', 'ultima semana',
        'semana passada', 'mês passado', 'mes passado', 'mês anterior', 'mes anterior'
    ];
    
    // Verificar se é uma pergunta (contém ?) ou usa palavras de consulta
    const isQuestion = lowerMsg.includes('?') || 
                      lowerMsg.includes('quanto') || 
                      lowerMsg.includes('quantos') || 
                      lowerMsg.includes('quantas') ||
                      lowerMsg.includes('quando') ||
                      lowerMsg.includes('como');
    
    // Verificar se contém palavras de consulta específicas
    const hasSpecificQuery = lowerMsg.includes('quanto gastei') || 
                            lowerMsg.includes('quanto recebi') || 
                            lowerMsg.includes('quanto ganhei') ||
                            lowerMsg.includes('quantos gastei') ||
                            lowerMsg.includes('quantos recebi') ||
                            lowerMsg.includes('quantos ganhei');
    
    // Verificar se contém período
    const hasPeriod = correctPeriodWords.some(period => lowerMsg.includes(period));
    
    // Dividir a mensagem em palavras para verificação com tolerância
    const words = lowerMsg.split(/\s+/);
    
    let hasQueryWithTolerance = false;
    let hasPeriodWithTolerance = false;
    
    // Verificar se alguma palavra está próxima de uma palavra-chave de consulta
    for (const word of words) {
        if (isCloseToCorrect(word, correctQueryWords, 0.6)) {
            const correctedWord = correctTypo(word, correctQueryWords, 0.6);
            console.log(`🔍 Palavra com erro de digitação detectada: "${word}" -> "${correctedWord}"`);
            hasQueryWithTolerance = true;
            break;
        }
    }
    
    // Verificar se alguma palavra está próxima de um período
    for (const word of words) {
        if (isCloseToCorrect(word, correctPeriodWords, 0.6)) {
            const correctedWord = correctTypo(word, correctPeriodWords, 0.6);
            console.log(`🔍 Palavra com erro de digitação detectada: "${word}" -> "${correctedWord}"`);
            hasPeriodWithTolerance = true;
            break;
        }
    }
    
    // Resultado final: deve ter consulta específica OU (pergunta + período)
    const hasQuery = hasSpecificQuery || hasQueryWithTolerance;
    const hasPeriodFinal = hasPeriod || hasPeriodWithTolerance;
    
    // Se tem consulta específica, não precisa de período
    if (hasSpecificQuery) {
        console.log('🔍 isSpecificQueryIntent: Consulta específica detectada:', message);
        return true;
    }
    
    // Se é uma pergunta e tem período, é uma consulta
    if (isQuestion && hasPeriodFinal) {
        console.log('🔍 isSpecificQueryIntent: Pergunta com período detectada:', message);
        return true;
    }
    
    console.log('🔍 isSpecificQueryIntent:', message, 'isQuestion:', isQuestion, 'hasSpecificQuery:', hasSpecificQuery, 'hasPeriod:', hasPeriodFinal);
    
    return false;
}

function isShowHelpIntent(message) {
    // Palavras-chave corretas para ajuda
    const correctHelpWords = [
        'ajuda', 'help', 'como usar', 'o que posso fazer', 'comandos', 'ajudar',
        'ajudando', 'ajudou', 'ajudar-me', 'ajudar me', 'como funciona', 'tutorial'
    ];
    
    // Dividir a mensagem em palavras
    const words = message.toLowerCase().split(/\s+/);
    
    // Verificar se alguma palavra está próxima de uma palavra-chave de ajuda
    for (const word of words) {
        if (isCloseToCorrect(word, correctHelpWords, 0.6)) {
            const correctedWord = correctTypo(word, correctHelpWords, 0.6);
            console.log(`🔍 Palavra com erro de digitação detectada: "${word}" -> "${correctedWord}"`);
            return true;
        }
    }
    
    // Se não encontrou com tolerância, verificar com método original
    return message.includes('ajuda') || message.includes('help') || message.includes('como usar') || 
           message.includes('o que posso fazer') || message.includes('comandos');
}

function isRecurringBillIntent(message) {
    const recurringKeywords = [
        'aluguel', 'aluguel vence', 'conta de luz', 'conta de água', 'netflix', 'spotify',
        'despesa recorrente', 'conta fixa', 'conta mensal', 'pagamento recorrente',
        'cadastrar conta', 'adicionar conta', 'minha conta de'
    ];
    return recurringKeywords.some(keyword => message.includes(keyword));
}

function isSummaryIntent(message) {
    const summaryKeywords = [
        'resumo', 'quanto gastei', 'quanto recebi', 'extrato', 'relatório', 'relatorio', 'movimentações',
        'gastos', 'receitas', 'despesas', 'balanço', 'balanco', 'resumo financeiro', 'resumo do mês',
        'resumo da semana', 'resumo de hoje', 'resumo de', 'quanto eu gastei', 'quanto eu recebi',
        'historico', 'histórico', 'relatorio completo', 'resumo melhorado', 'historico detalhado'
    ];
    return summaryKeywords.some(keyword => message.includes(keyword));
}

function isCorrectLastActionIntent(message) {
    const correctKeywords = ['corrigir', 'errei', 'desfazer', 'foi na outra conta', 'corrige', 'desfaz'];
    return correctKeywords.some(keyword => message.includes(keyword));
}

function isPeriodOnlyMessage(message) {
    const periodKeywords = ['hoje', 'esta semana', 'este mês', 'mês passado', 'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
    const hasPeriod = periodKeywords.some(keyword => message.includes(keyword));
    const hasOtherKeywords = ['quanto', 'gastei', 'recebi', 'resumo', 'extrato', 'relatório', 'relatorio', 'historico', 'histórico'].some(keyword => message.includes(keyword));
    
    return hasPeriod && !hasOtherKeywords;
}

// Funções para processar cada tipo de intenção









function processRecurringBillIntent(message, userAccounts, fixedBills = []) {
    // Verificar se userAccounts é válido
    if (!userAccounts || !Array.isArray(userAccounts)) {
        console.warn('⚠️ userAccounts é inválido em processRecurringBillIntent:', userAccounts);
        return {
            status: 'error',
            response: 'Erro interno: contas não disponíveis. Tente recarregar a página.'
        };
    }
    
    // Verificar se é para marcar como pago
    if (message.includes('paguei') || message.includes('paguei o') || message.includes('paguei a')) {
        return processMarkBillAsPaid(message, userAccounts, fixedBills);
    }
    
    // Verificar se é para cadastrar ou atualizar
    const amountMatch = message.match(/(\d+([.,]\d{1,2})?)/);
    if (!amountMatch) {
        return {
            status: 'clarification',
            response: "Qual o valor da conta recorrente? Por exemplo: 'Meu aluguel de R$2000 vence todo dia 10'"
        };
    }
    
    const amount = parseFloat(amountMatch[1].replace(',', '.'));
    
    // Extrair nome da conta recorrente
    const billName = extractBillName(message);
    if (!billName) {
        return {
            status: 'clarification',
            response: "Qual é o nome da conta recorrente? Por exemplo: 'Meu aluguel de R$2000 vence todo dia 10'"
        };
    }
    
    // Extrair data de vencimento
    const dueDate = extractDueDate(message);
    if (!dueDate) {
        return {
            status: 'clarification',
            response: `Em que dia do mês vence ${billName}? Por exemplo: 'Meu aluguel de R$2000 vence todo dia 10'`
        };
    }
    
    return {
        status: 'success',
        action: 'add_recurring_bill',
        data: {
            name: billName,
            amount: amount,
            dueDate: dueDate
        },
        response: `✅ Conta recorrente "${billName}" cadastrada: R$ ${amount.toFixed(2)} todo dia ${dueDate}`
    };
}

function processMarkBillAsPaid(message, userAccounts, fixedBills = []) {
    // Verificar se userAccounts é válido
    if (!userAccounts || !Array.isArray(userAccounts)) {
        console.warn('⚠️ userAccounts é inválido em processMarkBillAsPaid:', userAccounts);
        return {
            status: 'error',
            response: 'Erro interno: contas não disponíveis. Tente recarregar a página.'
        };
    }
    
    // Extrair nome da conta recorrente
    const billName = extractBillName(message);
    if (!billName) {
        return {
            status: 'clarification',
            response: "Qual conta recorrente você pagou? Por exemplo: 'Paguei o aluguel' ou 'Paguei a conta de luz'"
        };
    }
    
    // Extrair banco se mencionado na mensagem
    const mentionedBank = extractBankFromMessage(message);
    
    // Buscar contas fixas que correspondem ao nome mencionado
    const matchingBills = findMatchingFixedBills(billName, fixedBills);
    
    if (matchingBills.length === 0) {
        return {
            status: 'error',
            response: `Não encontrei nenhuma conta fixa chamada "${billName}". Verifique se ela está cadastrada no sistema.`
        };
    }
    
    // Se há múltiplas contas fixas com nomes similares, mostrar opções
    if (matchingBills.length > 1) {
        return {
            status: 'clarification',
            response: `Encontrei ${matchingBills.length} contas fixas similares a "${billName}". Qual delas você pagou?`,
            options: matchingBills.map(bill => ({ 
                name: `${bill.name} - R$ ${bill.amount.toFixed(2)} (Dia ${bill.dueDay})`, 
                id: bill.id,
                billData: bill
            })),
            pendingAction: {
                type: 'select_fixed_bill_for_payment',
                billName: billName,
                mentionedBank: mentionedBank
            }
        };
    }
    
    // Se há apenas uma conta fixa e um banco foi mencionado, processar diretamente
    if (matchingBills.length === 1 && mentionedBank) {
        const bill = matchingBills[0];
        const bankAccount = findBankAccount(mentionedBank, userAccounts);
        
        if (bankAccount) {
            return {
                status: 'success',
                action: 'mark_bill_as_paid',
                data: {
                    billId: bill.id,
                    billName: bill.name,
                    amount: bill.amount,
                    accountId: bankAccount.id,
                    bankName: bankAccount.name
                },
                response: `✅ Pagamento de ${bill.name} (R$ ${bill.amount.toFixed(2)}) registrado automaticamente na conta ${bankAccount.name}!`
            };
        }
    }
    
    // Caso padrão: verificar se há alguma conta com saldo suficiente
    const bill = matchingBills[0];
    
    // Verificar se há alguma conta com saldo suficiente
    const accountsWithSufficientBalance = userAccounts.filter(acc => acc && acc.name && acc.id && (acc.balance || 0) >= bill.amount);
    
    if (accountsWithSufficientBalance.length === 0) {
        // Nenhuma conta tem saldo suficiente
        return {
            status: 'error',
            response: `❌ Nenhuma conta tem saldo suficiente para pagar ${bill.name} (R$ ${bill.amount.toFixed(2)}).\n\n💡 **Sugestões:**\n• Adicione dinheiro a uma das suas contas\n• Reduza o valor da conta fixa\n• Use uma transferência de outra conta primeiro\n\n💰 **Seus saldos atuais:**\n${userAccounts.filter(acc => acc && acc.name && acc.id).map(acc => `• ${acc.name}: R$ ${(acc.balance || 0).toFixed(2)}`).join('\n')}`
        };
    }
    
    // Há contas com saldo suficiente, perguntar qual usar
    return {
        status: 'clarification',
        response: `Ótimo! De qual conta você usou o dinheiro para pagar ${bill.name} (R$ ${bill.amount.toFixed(2)})?`,
        options: accountsWithSufficientBalance.map(acc => ({ 
            name: `${acc.name} - Saldo: R$ ${(acc.balance || 0).toFixed(2)} ✅`, 
            id: acc.id 
        })),
        pendingAction: {
            type: 'mark_bill_as_paid',
            billId: bill.id,
            billName: bill.name,
            amount: bill.amount,
            mentionedBank: mentionedBank
        }
    };
}







function processCorrectLastActionIntent() {
    return {
        status: 'clarification',
        response: "O que você gostaria de corrigir na última transação?",
        options: [
            { name: "O Valor", id: "value" },
            { name: "A Conta", id: "account" },
            { name: "A Descrição", id: "description" },
            { name: "Cancelar Transação", id: "cancel" }
        ],
        pendingAction: {
            type: 'correct_last_action'
        }
    };
}

function processContextualSummary(message, conversationContext) {
    const { period, startDate, endDate } = extractPeriodFromMessage(message);
    
    if (period && startDate && endDate) {
        return {
            status: 'success',
            action: 'get_summary',
            data: {
                period: period,
                startDate: startDate,
                endDate: endDate
            },
            response: '' // Não exibir mensagem redundante
        };
    }
    
    return {
        status: 'error',
        response: 'Não consegui entender o período. Tente algo como "este mês" ou "janeiro".'
    };
}

// Funções auxiliares para extração de entidades

function extractDescription(message, ...prepositions) {
    for (const prep of prepositions) {
        const index = message.indexOf(prep);
        if (index !== -1) {
            const description = message.substring(index + prep.length).trim();
            // Remover palavras desnecessárias no final
            const cleanDescription = description.replace(/\b(da conta|no|na|com|para|de|do|da)\b/g, '').trim();
            return cleanDescription || null;
        }
    }
    return null;
}

function extractAccount(message, userAccounts) {
    console.log('🔍 extractAccount chamado com:', message);
    console.log('🔍 Contas disponíveis:', userAccounts.map(acc => acc?.name));
    
    // Verificar se userAccounts é válido
    if (!userAccounts || !Array.isArray(userAccounts)) {
        console.warn('⚠️ userAccounts é inválido em extractAccount:', userAccounts);
        return { status: 'error', message: 'Erro interno: contas não disponíveis' };
    }
    
    if (userAccounts.length === 0) {
        return { status: 'error', message: 'Nenhuma conta encontrada' };
    }
    
    const lowerMessage = message.toLowerCase();
    console.log('🔍 Mensagem em minúsculas:', lowerMessage);
    const foundAccounts = [];
    
    // Primeira passada: busca exata
    console.log('🔍 🔍 Primeira passada: busca exata');
    for (const account of userAccounts) {
        if (account && account.name) {
            const accountNameLower = account.name.toLowerCase();
            console.log(`🔍 Verificando conta: "${account.name}" (${accountNameLower})`);
            
            // Busca exata
            if (lowerMessage.includes(accountNameLower)) {
                console.log(`✅ Conta encontrada por busca exata: "${account.name}"`);
                foundAccounts.push({ account, matchType: 'exact', score: 1.0 });
            }
        }
    }
    
    // Segunda passada: busca por similaridade se não encontrou exato
    if (foundAccounts.length === 0) {
        console.log('🔍 🔍 Segunda passada: busca por similaridade');
        for (const account of userAccounts) {
            if (account && account.name) {
                const accountNameLower = account.name.toLowerCase();
                const words = accountNameLower.split(/\s+/);
                console.log(`🔍 Verificando palavras da conta "${account.name}":`, words);
                
                // Verificar se alguma palavra da conta está na mensagem
                let score = 0;
                let matchedWords = 0;
                
                for (const word of words) {
                    if (word.length > 2 && lowerMessage.includes(word)) {
                        score += 0.3;
                        matchedWords++;
                        console.log(`✅ Palavra "${word}" encontrada na mensagem`);
                    }
                }
                
                // Se encontrou pelo menos uma palavra significativa
                if (matchedWords > 0 && score > 0.2) {
                    console.log(`✅ Conta encontrada por similaridade: "${account.name}" (score: ${score})`);
                    foundAccounts.push({ account, matchType: 'partial', score: score });
                }
            }
        }
    }
    
    // Terceira passada: busca por abreviações comuns
    if (foundAccounts.length === 0) {
        console.log('🔍 🔍 Terceira passada: busca por abreviações');
        const commonAbbreviations = {
            'nubank': ['nu', 'nub'],
            'itau': ['itau', 'it'],
            'bradesco': ['brad', 'br'],
            'santander': ['sant', 'san'],
            'bb': ['banco do brasil', 'brasil'],
            'caixa': ['cef', 'cef']
        };
        
        for (const [fullName, abbreviations] of Object.entries(commonAbbreviations)) {
            for (const abbr of abbreviations) {
                if (lowerMessage.includes(abbr)) {
                    console.log(`🔍 Abreviação "${abbr}" encontrada, buscando por "${fullName}"`);
                    const matchingAccount = userAccounts.find(acc => 
                        acc && acc.name && acc.name.toLowerCase().includes(fullName)
                    );
                    if (matchingAccount) {
                        console.log(`✅ Conta encontrada por abreviação: "${matchingAccount.name}"`);
                        foundAccounts.push({ account: matchingAccount, matchType: 'abbreviation', score: 0.8 });
                        break;
                    }
                }
            }
        }
    }
    
    console.log('🔍 Total de contas encontradas:', foundAccounts.length);
    if (foundAccounts.length > 0) {
        foundAccounts.forEach((fa, index) => {
            console.log(`🔍 ${index + 1}. "${fa.account.name}" (${fa.matchType}, score: ${fa.score})`);
        });
    }
    
    if (foundAccounts.length === 0) {
        console.log('❌ Nenhuma conta encontrada');
        return { status: 'not_found' };
    }
    
    // Ordenar por score (maior primeiro) e por especificidade (nomes mais longos primeiro)
    foundAccounts.sort((a, b) => {
        // Primeiro por score
        if (b.score !== a.score) {
            return b.score - a.score;
        }
        // Se score igual, priorizar nomes mais específicos (mais longos)
        return b.account.name.length - a.account.name.length;
    });
    
    // IMPORTANTE: Se há conflito entre contas com scores iguais, 
    // verificar se uma é substring da outra e priorizar a mais específica
    if (foundAccounts.length > 1 && foundAccounts[0].score === foundAccounts[1].score) {
        const firstAccount = foundAccounts[0].account.name.toLowerCase();
        const secondAccount = foundAccounts[1].account.name.toLowerCase();
        
        // Se uma conta é substring da outra, priorizar a mais longa (mais específica)
        if (firstAccount.includes(secondAccount) || secondAccount.includes(firstAccount)) {
            console.log(`🔍 Conflito detectado entre contas similares: "${foundAccounts[0].account.name}" e "${foundAccounts[1].account.name}"`);
            console.log(`🔍 Priorizando a mais específica: "${foundAccounts[0].account.name}"`);
        }
    }
    
    console.log('🔍 Contas ordenadas por score e especificidade:');
    foundAccounts.forEach((fa, index) => {
        console.log(`🔍 ${index + 1}. "${fa.account.name}" (${fa.matchType}, score: ${fa.score}, length: ${fa.account.name.length})`);
    });
    
    // Se só encontrou uma conta, retornar ela
    if (foundAccounts.length === 1) {
        console.log(`✅ Retornando única conta encontrada: "${foundAccounts[0].account.name}"`);
        return {
            status: 'success',
            accountId: foundAccounts[0].account.id
        };
    }
    
    // Múltiplas contas encontradas - verificar se há uma com score muito maior
    const bestScore = foundAccounts[0].score;
    const closeScores = foundAccounts.filter(fa => fa.score >= bestScore * 0.8);
    console.log(`🔍 Melhor score: ${bestScore}, contas com score próximo: ${closeScores.length}`);
    
    if (closeScores.length === 1) {
        // Só uma conta com score alto, usar ela
        console.log(`✅ Retornando conta com melhor score: "${closeScores[0].account.name}"`);
        return {
            status: 'success',
            accountId: closeScores[0].account.id
        };
    }
    
    // IMPORTANTE: Se há conflito entre contas similares (uma substring da outra),
    // priorizar a mais específica (mais longa) automaticamente
    if (closeScores.length > 1) {
        const firstAccount = closeScores[0].account.name.toLowerCase();
        const secondAccount = closeScores[1].account.name.toLowerCase();
        
        // Se uma conta é substring da outra, usar a mais específica automaticamente
        if (firstAccount.includes(secondAccount) || secondAccount.includes(firstAccount)) {
            console.log(`🔍 Conflito entre contas similares resolvido automaticamente`);
            console.log(`✅ Retornando conta mais específica: "${closeScores[0].account.name}"`);
            return {
                status: 'success',
                accountId: closeScores[0].account.id
            };
        }
    }
    
    // Múltiplas contas com scores similares e não relacionadas - precisa de esclarecimento
    console.log(`🔍 Múltiplas contas com scores similares e não relacionadas, solicitando esclarecimento`);
    const clarificationAccounts = closeScores.map(fa => ({ 
        name: fa.account.name, 
        id: fa.account.id,
        matchType: fa.matchType,
        score: fa.score
    }));
    
    return {
        status: 'clarification',
        options: clarificationAccounts,
        message: `Encontrei múltiplas contas similares. Qual você quer usar?`
    };
}

// Identificação inteligente de conta em transações (despesa/receita)
function identifyAccountForTransaction(message, userAccounts, transactionType = 'expense') {
    // Validações básicas
    if (!userAccounts || !Array.isArray(userAccounts)) {
        return { status: 'error', message: 'Erro interno: contas não disponíveis' };
    }
    if (userAccounts.length === 0) {
        return { status: 'error', message: 'Nenhuma conta encontrada' };
    }
    // Se só existir uma conta, usar automaticamente
    if (userAccounts.length === 1) {
        return { status: 'success', accountId: userAccounts[0].id };
    }

    const originalMessage = (message || '').toLowerCase();

    // Padrões específicos de referência a contas
    const accountPatterns = [
        // "na/no/da/do conta/banco <nome>"
        /(?:na|no|da|do)\s+(?:conta\s+|banco\s+)?([a-záàâãéèêíìîóòôõúùûç_\-\s]+?)(?:\s|$)/i,
        // "com o cartão <nome>", "pelo/pela <nome>"
        /(?:com\s+o\s+cartão|com\s+o|com\s+a|pelo|pela)\s+([a-záàâãéèêíìîóòôõúùûç_\-\s]+?)(?:\s|$)/i
    ];

    // 1) Tentar extrair o trecho do nome e mapear para uma conta existente
    for (const pattern of accountPatterns) {
        const match = originalMessage.match(pattern);
        if (match && match[1]) {
            const candidate = match[1].trim();
            const accountResult = extractAccount(candidate, userAccounts);
            if (accountResult.status === 'success') {
                return accountResult;
            }
        }
    }

    // 2) Fallback: procurar diretamente qualquer nome de conta presente na mensagem completa
    const directAccountResult = extractAccount(originalMessage, userAccounts);
    if (directAccountResult.status === 'success') {
        return directAccountResult;
    }
    if (directAccountResult.status === 'clarification') {
        return directAccountResult;
    }

    // 3) Sem pistas suficientes -> pedir esclarecimento
    return {
        status: 'clarification',
        message: `Em qual conta você ${transactionType === 'income' ? 'recebeu' : 'gastou'}?`,
        options: userAccounts.filter(acc => acc && acc.id && acc.name).map(acc => ({ name: acc.name, id: acc.id }))
    };
}

function extractAccountName(message) {
    // Padrões para extrair nome da conta, incluindo nomes com espaços
    const patterns = [
        // Padrão com aspas duplas: "criar conta "Nubank Empresarial""
        /criar conta ["']([^"']+)["']/i,
        /nova conta ["']([^"']+)["']/i,
        /adicionar conta ["']([^"']+)["']/i,
        
        // Padrão sem aspas: "criar conta Nubank Empresarial"
        /criar conta\s+([a-záàâãéèêíìîóòôõúùûç\s]+?)(?:\s|$)/i,
        /nova conta\s+([a-záàâãéèêíìîóòôõúùûç\s]+?)(?:\s|$)/i,
        /adicionar conta\s+([a-záàâãéèêíìîóòôõúùûç\s]+?)(?:\s|$)/i,
        
        // Padrão com underscore: "criar conta Nubank_Empresarial"
        /criar conta\s+([a-záàâãéèêíìîóòôõúùûç_\s]+?)(?:\s|$)/i,
        /nova conta\s+([a-záàâãéèêíìîóòôõúùûç_\s]+?)(?:\s|$)/i,
        /adicionar conta\s+([a-záàâãéèêíìîóòôõúùûç_\s]+?)(?:\s|$)/i
    ];
    
    for (const pattern of patterns) {
        const match = message.match(pattern);
        if (match && match[1]) {
            let accountName = match[1].trim();
            
            // Limpar o nome da conta
            accountName = accountName.replace(/\s+/g, ' '); // Normalizar espaços
            accountName = accountName.replace(/^\s+|\s+$/g, ''); // Remover espaços no início/fim
            
            // Se o nome tem espaços mas não está entre aspas, sugerir usar aspas
            if (accountName.includes(' ') && !message.includes('"') && !message.includes("'")) {
                console.log(`🔍 Nome de conta com espaços detectado: "${accountName}"`);
                console.log(`💡 Sugestão: Use aspas para nomes com espaços: "criar conta "${accountName}""`);
            }
            
            // Validar se o nome não está vazio
            if (accountName.length > 0) {
                return accountName;
            }
        }
    }
    
    // Se não encontrou com os padrões principais, tentar extrair o que vem após "conta"
    const contaMatch = message.match(/(?:criar|nova|adicionar)\s+conta\s+(.+)/i);
    if (contaMatch && contaMatch[1]) {
        let accountName = contaMatch[1].trim();
        
        // Remover palavras desnecessárias no final
        accountName = accountName.replace(/\s+(?:com|saldo|inicial|de|para|no|na|em|sobre|referente\s+a).*$/i, '');
        accountName = accountName.replace(/\s+$/g, ''); // Remover espaços no final
        
        if (accountName.length > 0) {
            console.log(`🔍 Nome de conta extraído alternativamente: "${accountName}"`);
            return accountName;
        }
    }
    
    return null;
}

function extractSourceAccount(message, userAccounts) {
    console.log('🔍 extractSourceAccount chamado com:', message);
    
    // Verificar se userAccounts é válido
    if (!userAccounts || !Array.isArray(userAccounts)) {
        console.warn('⚠️ userAccounts é inválido em extractSourceAccount:', userAccounts);
        return { status: 'error', message: 'Erro interno: contas não disponíveis' };
    }
    
    // Buscar por preposições que indicam origem
    const sourcePrepositions = ['de', 'da', 'do', 'desde'];
    let sourceAccountName = null;
    
    for (const prep of sourcePrepositions) {
        const index = message.indexOf(prep);
        if (index !== -1) {
            console.log('🔍 Preposição de origem encontrada:', prep, 'em posição:', index);
            
            // Procurar por nomes de contas após a preposição
            let textAfterPrep = message.substring(index + prep.length).trim();
            console.log('🔍 Texto após preposição (antes da limpeza):', textAfterPrep);
            
            // IMPORTANTE: Parar quando encontrar palavras que indicam destino
            const destinationKeywords = ['para', 'pra', 'em', 'no', 'na'];
            for (const destKeyword of destinationKeywords) {
                const destIndex = textAfterPrep.toLowerCase().indexOf(destKeyword);
                if (destIndex !== -1) {
                    console.log('🔍 Palavra de destino encontrada:', destKeyword, 'em posição:', destIndex);
                    textAfterPrep = textAfterPrep.substring(0, destIndex).trim();
                    console.log('🔍 Texto após limpeza (removendo destino):', textAfterPrep);
                    break;
                }
            }
            
            // Usar a função extractAccount melhorada para encontrar a conta
            const accountResult = extractAccount(textAfterPrep, userAccounts);
            console.log('🔍 Resultado da busca por conta:', accountResult);
            
            if (accountResult.status === 'success') {
                return accountResult;
            } else if (accountResult.status === 'clarification') {
                return accountResult;
            }
        }
    }
    
    // Se não encontrou com preposições, tentar buscar por contexto
    // Procurar por padrões como "transferir X do Y" ou "gastei X da conta Y"
    const contextPatterns = [
        /(?:transferir|transferi|mover|movi|transfira|transfere)\s+(?:r?\$?\s*\d+[.,]?\d*)\s+(?:de|da|do)\s+(.+?)(?:\s+(?:para|pra|em|no|na)|$)/i,
        /(?:gastei|paguei|comprei)\s+(?:r?\$?\s*\d+[.,]?\d*)\s+(?:da|do|na|no)\s+(.+?)(?:\s|$)/i
    ];
    
    for (const pattern of contextPatterns) {
        const match = message.match(pattern);
        if (match && match[1]) {
            console.log('🔍 Padrão de contexto encontrado:', match[0]);
            const accountText = match[1].trim();
            console.log('🔍 Texto da conta extraído:', accountText);
            
            const accountResult = extractAccount(accountText, userAccounts);
            console.log('🔍 Resultado da busca por conta no contexto:', accountResult);
            
            if (accountResult.status === 'success') {
                return accountResult;
            } else if (accountResult.status === 'clarification') {
                return accountResult;
            }
        }
    }
    
    console.log('🔍 Nenhuma conta de origem encontrada');
    return { status: 'not_found' };
}

function extractDestinationAccount(message, userAccounts, excludeAccountId) {
    console.log('🔍 extractDestinationAccount chamado com:', message, 'excluindo:', excludeAccountId);
    
    // Verificar se userAccounts é válido
    if (!userAccounts || !Array.isArray(userAccounts)) {
        console.warn('⚠️ userAccounts é inválido em extractDestinationAccount:', userAccounts);
        return { status: 'error', message: 'Erro interno: contas não disponíveis' };
    }
    
    // Buscar por preposições que indicam destino
    const destPrepositions = ['para', 'pra', 'em', 'no', 'na'];
    
    for (const prep of destPrepositions) {
        const index = message.indexOf(prep);
        if (index !== -1) {
            console.log('🔍 Preposição de destino encontrada:', prep, 'em posição:', index);
            
            // Procurar por nomes de contas após a preposição
            let textAfterPrep = message.substring(index + prep.length).trim();
            console.log('🔍 Texto após preposição de destino (antes da limpeza):', textAfterPrep);
            
            // Parar quando encontrar palavras que não são relevantes para o nome da conta
            const stopKeywords = ['conta', 'banco', 'cartão', 'de', 'da', 'do', 'com', 'para', 'pra'];
            for (const stopKeyword of stopKeywords) {
                const stopIndex = textAfterPrep.toLowerCase().indexOf(stopKeyword);
                if (stopIndex !== -1 && stopIndex > 0) { // Só parar se não for no início
                    console.log('🔍 Palavra de parada encontrada:', stopKeyword, 'em posição:', stopIndex);
                    textAfterPrep = textAfterPrep.substring(0, stopIndex).trim();
                    console.log('🔍 Texto após limpeza (removendo palavras irrelevantes):', textAfterPrep);
                    break;
                }
            }
            
            // Filtrar contas excluindo a conta de origem
            const availableAccounts = userAccounts.filter(acc => 
                acc && acc.id && acc.id !== excludeAccountId
            );
            console.log('🔍 Contas disponíveis para destino:', availableAccounts.map(acc => acc.name));
            
            // Usar a função extractAccount melhorada para encontrar a conta
            const accountResult = extractAccount(textAfterPrep, availableAccounts);
            console.log('🔍 Resultado da busca por conta de destino:', accountResult);
            
            if (accountResult.status === 'success') {
                return accountResult;
            } else if (accountResult.status === 'clarification') {
                return accountResult;
            }
        }
    }
    
    // Se não encontrou com preposições, tentar buscar por contexto
    // Procurar por padrões como "transferir X para Y" ou "mover X para Y"
    const contextPatterns = [
        /(?:transferir|transferi|mover|movi|transfira|transfere)\s+(?:r?\$?\s*\d+[.,]?\d*)\s+(?:de|da|do)\s+.+?\s+(?:para|pra|em|no|na)\s+(.+?)(?:\s|$)/i,
        /(?:para|pra|em|no|na)\s+(.+?)(?:\s+(?:conta|banco|cartão)|$)/i
    ];
    
    for (const pattern of contextPatterns) {
        const match = message.match(pattern);
        if (match && match[1]) {
            const accountText = match[1].trim();
            
            // Filtrar contas excluindo a conta de origem
            const availableAccounts = userAccounts.filter(acc => 
                acc && acc.id && acc.id !== excludeAccountId
            );
            
            const accountResult = extractAccount(accountText, availableAccounts);
            
            if (accountResult.status === 'success') {
                return accountResult;
            } else if (accountResult.status === 'clarification') {
                return accountResult;
            }
        }
    }
    
    console.log('🔍 Nenhuma conta de destino encontrada');
    return { status: 'not_found' };
}

function extractBillName(message) {
    // Buscar por padrões comuns de contas recorrentes
    const billPatterns = [
        /(?:meu|minha)\s+([a-záàâãéèêíìîóòôõúùûç\s]+?)\s+(?:de|vence|vale|custa)/i,
        /(?:conta\s+de\s+)([a-záàâãéèêíìîóòôõúùûç\s]+?)(?:\s+de|\s+vale|\s+custa|$)/i,
        /(?:paguei\s+(?:o|a)\s+)([a-záàâãéèêíìîóòôõúùûç\s]+?)(?:\s+de|\s+com|\s+$)/i
    ];
    
    for (const pattern of billPatterns) {
        const match = message.match(pattern);
        if (match && match[1]) {
            return match[1].trim();
        }
    }
    
    // Buscar por palavras-chave específicas
    const billKeywords = ['aluguel', 'luz', 'água', 'internet', 'netflix', 'spotify', 'gás', 'condomínio'];
    for (const keyword of billKeywords) {
        if (message.includes(keyword)) {
            return keyword;
        }
    }
    
    return null;
}

function extractDueDate(message) {
    // Buscar por padrões de data
    const datePatterns = [
        /(?:dia\s+)(\d{1,2})/i,
        /(?:todo\s+dia\s+)(\d{1,2})/i,
        /(?:vence\s+(?:todo\s+)?dia\s+)(\d{1,2})/i,
        /(?:dia\s+)(\d{1,2})(?:\s+do\s+mês|\s+de\s+cada\s+mês)/i
    ];
    
    for (const pattern of datePatterns) {
        const match = message.match(pattern);
        if (match && match[1]) {
            const day = parseInt(match[1]);
            if (day >= 1 && day <= 31) {
                return day;
            }
        }
    }
    
    return null;
}

// Função para processar respostas de esclarecimento
export const processClarificationResponse = (response, pendingAction, userAccounts, fixedBills = []) => {
    if (!pendingAction) {
        return {
            status: 'error',
            response: "Não há ação pendente para processar."
        };
    }
    
    switch (pendingAction.type) {
        case 'correct_last_action':
            // response deve ser o tipo de correção
            switch (response) {
                case 'value':
                    return {
                        status: 'clarification',
                        response: "Qual é o valor correto?",
                        pendingAction: {
                            type: 'correct_transaction_value'
                        }
                    };
                case 'account':
                    // Verificar se userAccounts é válido
                    if (!userAccounts || !Array.isArray(userAccounts)) {
                        console.warn('⚠️ userAccounts é inválido em processClarificationResponse:', userAccounts);
                        return {
                            status: 'error',
                            response: 'Erro interno: contas não disponíveis. Tente recarregar a página.'
                        };
                    }
                    return {
                        status: 'clarification',
                        response: "Qual é a conta correta?",
                        options: userAccounts.filter(acc => acc && acc.name && acc.id).map(acc => ({ name: acc.name, id: acc.id })),
                        pendingAction: {
                            type: 'correct_transaction_account'
                        }
                    };
                case 'description':
                    return {
                        status: 'clarification',
                        response: "Qual é a descrição correta?",
                        pendingAction: {
                            type: 'correct_transaction_description'
                        }
                    };
                case 'cancel':
                    return {
                        status: 'success',
                        action: 'cancel_last_transaction',
                        response: "✅ Última transação cancelada com sucesso!"
                    };
                default:
                    return {
                        status: 'error',
                        response: "Opção não reconhecida."
                    };
            }
            
        case 'add_expense_with_time':
        case 'add_income_with_time':
            // Processar horário para transações com data passada
            const timeInfo = extractTimeFromMessage(response);
            if (!timeInfo) {
                return {
                    status: 'clarification',
                    response: 'Formato de horário não reconhecido. 💡 Use: "18:00", "18 horas", "18", "18,00"',
                    pendingAction: pendingAction
                };
            }
            
            // Aplicar o horário à data
            const finalDate = new Date(pendingAction.dateInfo.date);
            finalDate.setHours(timeInfo.hours, timeInfo.minutes, 0, 0);
            
            // Registrar a transação com a data e horário corretos
            return {
                status: 'success',
                action: 'add_transaction',
                data: {
                    type: pendingAction.type === 'add_expense_with_time' ? 'expense' : 'income',
                    amount: pendingAction.amount,
                    description: pendingAction.description,
                    accountId: pendingAction.accountId,
                    timestamp: finalDate
                },
                response: `✅ ${pendingAction.type === 'add_expense_with_time' ? 'Despesa' : 'Receita'} registrada: ${pendingAction.description} - R$ ${(pendingAction.amount || 0).toFixed(2)} na conta ${userAccounts.find(acc => acc.id === pendingAction.accountId)?.name || 'principal'} ${pendingAction.dateInfo.message} às ${timeInfo.formatted}`
            };
            
        case 'perform_transfer_with_time':
            // Processar horário para transferências com data passada
            const transferTimeInfo = extractTimeFromMessage(response);
            if (!transferTimeInfo) {
                return {
                    status: 'clarification',
                    response: 'Formato de horário não reconhecido. 💡 Use: "18:00", "18 horas", "18", "18,00"',
                    pendingAction: pendingAction
                };
            }
            
            // Aplicar o horário à data
            const finalTransferDate = new Date(pendingAction.dateInfo.date);
            finalTransferDate.setHours(transferTimeInfo.hours, transferTimeInfo.minutes, 0, 0);
            
            // Registrar a transferência com a data e horário corretos
            return {
                status: 'success',
                action: 'perform_transfer',
                data: {
                    fromAccountId: pendingAction.fromAccountId,
                    toAccountId: pendingAction.toAccountId,
                    amount: pendingAction.amount,
                    timestamp: finalTransferDate
                },
                response: `✅ Transferência realizada: R$ ${(pendingAction.amount || 0).toFixed(2)} de ${userAccounts.find(acc => acc.id === pendingAction.fromAccountId)?.name || 'conta origem'} para ${userAccounts.find(acc => acc.id === pendingAction.toAccountId)?.name || 'conta destino'} ${pendingAction.dateInfo.message} às ${transferTimeInfo.formatted}`
            };
            
        case 'add_expense':
        case 'add_income':
            console.log(`🔍 processClarificationResponse: processando ${pendingAction.type}`);
            console.log(`🔍 response:`, response);
            console.log(`🔍 pendingAction:`, pendingAction);
            console.log(`🔍 userAccounts:`, userAccounts);
            
            // Verificar se userAccounts é válido
            if (!userAccounts || !Array.isArray(userAccounts)) {
                console.warn('⚠️ userAccounts é inválido em processClarificationResponse:', userAccounts);
                return {
                    status: 'error',
                    response: 'Erro interno: contas não disponíveis. Tente recarregar a página.'
                };
            }
            
            // Se não tem descrição, o response deve ser a descrição
            if (!pendingAction.description) {
                console.log(`🔍 Sem descrição, salvando descrição: ${response}`);
                
                // Verificar se a descrição fornecida pode ser um nome de conta
                const possibleAccount = userAccounts.find(acc => 
                    acc && acc.name && acc.name.toLowerCase() === response.toLowerCase()
                );
                
                if (possibleAccount) {
                    console.log(`🔍 Descrição pode ser uma conta, registrando diretamente`);
                    // Se a descrição fornecida é um nome de conta válido, usar ela
                    return {
                        status: 'success',
                        action: 'add_transaction',
                        data: {
                            description: possibleAccount.name, // Usar o nome da conta como descrição
                            amount: pendingAction.amount,
                            type: pendingAction.type === 'add_expense' ? 'expense' : 'income',
                            accountId: possibleAccount.id
                        },
                        response: `✅ ${pendingAction.type === 'add_expense' ? 'Despesa' : 'Receita'} registrada: ${possibleAccount.name} - R$ ${(pendingAction.amount || 0).toFixed(2)} na conta ${possibleAccount.name}`
                    };
                }
                
                // Verificar se o amount é válido antes de usar toFixed
                if (!pendingAction.amount || isNaN(pendingAction.amount)) {
                    return {
                        status: 'error',
                        response: '❌ Valor da despesa não foi reconhecido. Por favor, digite novamente com o valor: "Gastei R$50 em almoço"',
                        pendingAction: null
                    };
                }
                
                return {
                    status: 'clarification',
                    response: `Em qual conta você ${pendingAction.type === 'add_expense' ? 'gastou' : 'recebeu'} R$ ${(pendingAction.amount || 0).toFixed(2)}?\n\n💡 **Responda apenas com o nome da conta** (ex: "Nubank", "PicPay")`,
                    pendingAction: {
                        type: pendingAction.type,
                        amount: pendingAction.amount,
                        description: response, // Salvar a descrição fornecida
                        accountId: null
                    }
                };
            }
            
                    // Se tem descrição mas não tem conta, o response pode ser o nome da conta ou o ID
        if (!pendingAction.accountId) {
            console.log(`🔍 Sem conta, buscando conta. Response pode ser nome ou ID: ${response}`);
            
            // Primeiro, tentar encontrar por ID (caso o usuário tenha clicado em uma opção)
            let account = userAccounts.find(acc => acc && acc.id === response);
            
            // Se não encontrou por ID, tentar por nome
            if (!account) {
                console.log(`🔍 Não encontrado por ID, tentando por nome: ${response}`);
                account = userAccounts.find(acc => 
                    acc && acc.name && acc.name.toLowerCase() === response.toLowerCase()
                );
            }
            
            if (!account) {
                console.log(`❌ Conta não encontrada para nome/ID: ${response}`);
                return {
                    status: 'error',
                    response: `❌ Conta "${response}" não encontrada. Suas contas disponíveis são: ${userAccounts.map(acc => acc.name).join(', ')}`
                };
            }
            
            console.log(`🔍 Conta encontrada:`, account);
            
            // Verificar saldo antes de permitir despesa
            if (pendingAction.type === 'add_expense') {
                const currentBalance = account.balance || 0;
                // Verificar se o amount é válido antes de usar
                if (!pendingAction.amount || isNaN(pendingAction.amount)) {
                    return {
                        status: 'error',
                        response: '❌ Valor da despesa não foi reconhecido. Por favor, digite novamente com o valor: "Gastei R$50 em almoço"',
                        pendingAction: null
                    };
                }
                
                if (currentBalance < pendingAction.amount) {
                    return {
                        status: 'error',
                        response: `❌ Saldo insuficiente! A conta "${account.name}" tem apenas R$ ${currentBalance.toFixed(2)} disponível. Você precisa de R$ ${(pendingAction.amount || 0).toFixed(2)} para esta despesa.\n\n💡 **Sugestões:**\n• Adicione dinheiro à conta primeiro\n• Use uma conta com saldo suficiente\n• Reduza o valor da despesa`
                    };
                }
                
                console.log(`✅ Saldo suficiente: ${account.name} - Saldo atual: R$ ${currentBalance.toFixed(2)}, Despesa: R$ ${(pendingAction.amount || 0).toFixed(2)}`);
            }
            
            // Agora tem tudo: descrição e conta
            const result = {
                status: 'success',
                action: 'add_transaction',
                data: {
                    description: pendingAction.description,
                    amount: pendingAction.amount,
                    type: pendingAction.type === 'add_expense' ? 'expense' : 'income',
                    accountId: account.id
                },
                response: `✅ ${pendingAction.type === 'add_expense' ? 'Despesa' : 'Receita'} registrada: ${pendingAction.description} - R$ ${(pendingAction.amount || 0).toFixed(2)} na conta ${account.name}`
            };
            
            console.log(`🔍 Resultado retornado:`, result);
            return result;
        }
            
            // Se chegou aqui, algo deu errado
            console.warn('⚠️ Estado inesperado em processClarificationResponse:', pendingAction);
            return {
                status: 'error',
                response: 'Erro interno: estado inesperado. Tente novamente.'
            };
            
        case 'create_account':
            // response deve ser o saldo inicial
            const initialBalance = parseFloat(response);
            if (isNaN(initialBalance) || initialBalance < 0) {
                // Verificar se o usuário digitou texto em vez de número
                if (isNaN(parseFloat(response)) && response.trim().length > 0) {
                    return {
                        status: 'error',
                        response: `❌ "${response}" não é um valor válido para saldo.\n\nDigite apenas o número: 100, 50.50, 1000`
                    };
                }
                return {
                    status: 'error',
                    response: "Por favor, informe um valor válido para o saldo inicial.\n\nDigite apenas o número: 100, 50.50, 1000"
                };
            }
            
            // Verificar se o nome da conta é válido
            if (!pendingAction.accountName || pendingAction.accountName === 'null') {
                return {
                    status: 'error',
                    response: "❌ Nome da conta inválido. Tente novamente: \"criar conta Nubank\""
                };
            }
            
            return {
                status: 'success',
                action: 'create_account',
                data: {
                    accountName: pendingAction.accountName,
                    initialBalance: initialBalance
                },
                response: `✅ Conta "${pendingAction.accountName}" criada com saldo inicial de R$ ${initialBalance.toFixed(2)}`
            };
            
        case 'transfer_source':
            // response deve ser o ID da conta de origem
            const sourceAccount = userAccounts.find(acc => acc && acc.id === response);
            if (!sourceAccount) {
                return {
                    status: 'error',
                    response: "Conta de origem não encontrada. Tente novamente."
                };
            }
            
            return {
                status: 'clarification',
                response: `Para qual conta você quer transferir R$ ${(pendingAction.amount || 0).toFixed(2)}?`,
                options: userAccounts.filter(acc => acc && acc.id && acc.name && acc.id !== response).map(acc => ({ name: acc.name, id: acc.id })),
                pendingAction: {
                    type: 'transfer_destination',
                    amount: pendingAction.amount,
                    fromAccountId: response
                }
            };
            
        case 'transfer_destination':
            // response deve ser o ID da conta de destino
            const destAccount = userAccounts.find(acc => acc && acc.id === response);
            if (!destAccount) {
                return {
                    status: 'error',
                    response: "Conta de destino não encontrada. Tente novamente."
                };
            }
            
            return {
                status: 'success',
                action: 'perform_transfer',
                data: {
                    fromAccountId: pendingAction.fromAccountId,
                    toAccountId: response,
                    amount: pendingAction.amount
                },
                response: `✅ Transferência configurada: R$ ${(pendingAction.amount || 0).toFixed(2)} de ${userAccounts.find(acc => acc && acc.id === pendingAction.fromAccountId)?.name} para ${destAccount.name}`
            };
            
        case 'fixed_bill_payment_selection':
            // response deve ser o ID da conta usada para pagar
            const selectedPaymentAccount = userAccounts.find(acc => acc && acc.id === response);
            if (!selectedPaymentAccount) {
                return {
                    status: 'error',
                    response: "Conta não encontrada. Tente novamente."
                };
            }
            
            // Processar pagamento da conta fixa
            const billAmount = pendingAction.amount || pendingAction.billData.amount || 0;
            
            // VALIDAÇÃO DE SALDO - IMPEDIR PAGAMENTO SEM DINHEIRO
            const selectedAccountBalance = selectedPaymentAccount.balance || 0;
            if (selectedAccountBalance < billAmount) {
                return {
                    status: 'error',
                    response: `❌ Saldo insuficiente! A conta "${selectedPaymentAccount.name}" tem apenas R$ ${selectedAccountBalance.toFixed(2)} disponível. Você precisa de R$ ${billAmount.toFixed(2)} para pagar ${pendingAction.billData.name}.\n\n💡 **Sugestões:**\n• Adicione dinheiro à conta primeiro\n• Use uma conta com saldo suficiente\n• Reduza o valor da conta fixa\n\n🔄 **Tente novamente escolhendo outra conta:**`,
                    options: userAccounts.filter(acc => acc && acc.name && acc.id && acc.balance >= billAmount).map(acc => ({
                        name: `${acc.name} - Saldo: R$ ${acc.balance.toFixed(2)} ✅`,
                        id: acc.id,
                        accountData: acc
                    })),
                    pendingAction: {
                        type: 'fixed_bill_payment_selection',
                        billData: pendingAction.billData,
                        amount: pendingAction.amount,
                        originalMessage: pendingAction.originalMessage
                    }
                };
            }
            
            // Saldo suficiente - permitir pagamento
            return {
                status: 'success',
                action: 'add_transaction',
                data: {
                    description: `Pagamento de ${pendingAction.billData.name}`,
                    amount: billAmount,
                    type: 'expense',
                    accountId: response
                },
                response: `✅ Pagamento de ${pendingAction.billData.name} (R$ ${billAmount.toFixed(2)}) registrado na conta ${selectedPaymentAccount.name}!`
            };
            
        case 'mark_bill_as_paid':
            // response deve ser o ID da conta usada para pagar
            const paymentAccount = userAccounts.find(acc => acc && acc.id === response);
            if (!paymentAccount) {
                return {
                    status: 'error',
                    response: "Conta não encontrada. Tente novamente."
                };
            }
            
            // VALIDAÇÃO DE SALDO - IMPEDIR PAGAMENTO SEM DINHEIRO
            const paymentAccountBalance = paymentAccount.balance || 0;
            if (paymentAccountBalance < pendingAction.amount) {
                return {
                    status: 'error',
                    response: `❌ Saldo insuficiente! A conta "${paymentAccount.name}" tem apenas R$ ${paymentAccountBalance.toFixed(2)} disponível. Você precisa de R$ ${pendingAction.amount.toFixed(2)} para pagar ${pendingAction.billName}.\n\n💡 **Sugestões:**\n• Adicione dinheiro à conta primeiro\n• Use uma conta com saldo suficiente\n• Reduza o valor da conta fixa\n\n🔄 **Tente novamente escolhendo outra conta:**`,
                    options: userAccounts.filter(acc => acc && acc.name && acc.id && acc.balance >= pendingAction.amount).map(acc => ({
                        name: `${acc.name} - Saldo: R$ ${acc.balance.toFixed(2)} ✅`,
                        id: acc.id,
                        accountData: acc
                    })),
                    pendingAction: {
                        type: 'mark_bill_as_paid',
                        billId: pendingAction.billId,
                        billName: pendingAction.billName,
                        amount: pendingAction.amount,
                        mentionedBank: pendingAction.mentionedBank
                    }
                };
            }
            
            // Saldo suficiente - permitir pagamento
            return {
                status: 'success',
                action: 'mark_bill_as_paid',
                data: {
                    billId: pendingAction.billId,
                    billName: pendingAction.billName,
                    amount: pendingAction.amount,
                    accountId: response,
                    mentionedBank: pendingAction.mentionedBank
                },
                response: `✅ Pagamento de ${pendingAction.billName} (R$ ${pendingAction.amount.toFixed(2)}) registrado na conta ${paymentAccount.name}!`
            };
            
        case 'select_fixed_bill_for_payment':
            // response deve ser o ID da conta fixa selecionada
            // Preciso encontrar a conta fixa baseada no ID retornado
            const selectedBill = fixedBills.find(bill => bill.id === response);
            if (!selectedBill) {
                return {
                    status: 'error',
                    response: "Erro interno: conta fixa selecionada não encontrada. Tente novamente."
                };
            }
            
            // Se um banco foi mencionado, tentar processar diretamente
            if (pendingAction.mentionedBank) {
                const bankAccount = findBankAccount(pendingAction.mentionedBank, userAccounts);
                if (bankAccount) {
                    // VALIDAÇÃO DE SALDO - IMPEDIR PAGAMENTO SEM DINHEIRO
                    const bankAccountBalance = bankAccount.balance || 0;
                    if (bankAccountBalance < selectedBill.amount) {
                        return {
                            status: 'error',
                            response: `❌ Saldo insuficiente! A conta "${bankAccount.name}" tem apenas R$ ${bankAccountBalance.toFixed(2)} disponível. Você precisa de R$ ${selectedBill.amount.toFixed(2)} para pagar ${selectedBill.name}.\n\n💡 **Sugestões:**\n• Adicione dinheiro à conta primeiro\n• Use uma conta com saldo suficiente\n• Reduza o valor da conta fixa\n\n🔄 **Tente novamente escolhendo outra conta:**`,
                            options: userAccounts.filter(acc => acc && acc.name && acc.id && acc.balance >= selectedBill.amount).map(acc => ({
                                name: `${acc.name} - Saldo: R$ ${acc.balance.toFixed(2)} ✅`,
                                id: acc.id,
                                accountData: acc
                            })),
                            pendingAction: {
                                type: 'select_fixed_bill_for_payment',
                                billName: pendingAction.billName,
                                mentionedBank: pendingAction.mentionedBank
                            }
                        };
                    }
                    
                    // Saldo suficiente - permitir pagamento
                    return {
                        status: 'success',
                        action: 'mark_bill_as_paid',
                        data: {
                            billId: selectedBill.id,
                            billName: selectedBill.name,
                            amount: selectedBill.amount,
                            accountId: bankAccount.id,
                            bankName: bankAccount.name
                        },
                        response: `✅ Pagamento de ${selectedBill.name} (R$ ${selectedBill.amount.toFixed(2)}) registrado automaticamente na conta ${bankAccount.name}!`
                    };
                }
            }
            
            // Caso padrão: perguntar de qual conta foi usado o dinheiro
            return {
                status: 'clarification',
                response: `Ótimo! De qual conta você usou o dinheiro para pagar ${selectedBill.name} (R$ ${selectedBill.amount.toFixed(2)})?`,
                options: userAccounts.filter(acc => acc && acc.name && acc.id).map(acc => ({ name: acc.name, id: acc.id })),
                pendingAction: {
                    type: 'mark_bill_as_paid',
                    billId: selectedBill.id,
                    billName: selectedBill.name,
                    amount: selectedBill.amount,
                    mentionedBank: pendingAction.mentionedBank
                }
            };
            
        case 'clarify_month_for_summary':
            if (response === "Sim") {
                // Usar o período já definido (mês atual)
                return {
                    status: 'success',
                    action: 'get_summary',
                    data: {
                        startDate: pendingAction.timePeriod.startDate,
                        endDate: pendingAction.timePeriod.endDate,
                        period: pendingAction.timePeriod.period
                    },
                    response: '' // Não exibir mensagem redundante
                };
            } else {
                // Perguntar qual mês
                return {
                    status: 'clarification',
                    response: "De qual mês você gostaria de ver o resumo?",
                    pendingAction: {
                        type: 'specify_month_for_summary',
                        timePeriod: pendingAction.timePeriod
                    }
                };
            }
            
        case 'specify_month_for_summary':
            // response deve ser o nome ou número do mês
            const monthInput = response.toLowerCase();
            let monthIndex = -1;
            
            // Tentar extrair mês por nome
            const monthNames = {
                'janeiro': 0, 'fevereiro': 1, 'março': 2, 'abril': 3, 'maio': 4, 'junho': 5,
                'julho': 6, 'agosto': 7, 'setembro': 8, 'outubro': 9, 'novembro': 10, 'dezembro': 11
            };
            
            if (monthNames[monthInput]) {
                monthIndex = monthNames[monthInput];
            } else {
                // Tentar extrair por número
                const monthNumberMatch = monthInput.match(/(\d{1,2})/);
                if (monthNumberMatch) {
                    monthIndex = parseInt(monthNumberMatch[1]) - 1;
                }
            }
            
            if (monthIndex >= 0 && monthIndex <= 11) {
                const currentYear = new Date().getFullYear();
                const startDate = new Date(currentYear, monthIndex, pendingAction.timePeriod.startDate.getDate());
                const endDate = new Date(currentYear, monthIndex, pendingAction.timePeriod.endDate.getDate(), 23, 59, 59);
                
                return {
                    status: 'success',
                    action: 'get_summary',
                    data: {
                        startDate: startDate,
                        endDate: endDate,
                        period: `do dia ${pendingAction.timePeriod.startDate.getDate()} ao dia ${pendingAction.timePeriod.endDate.getDate()} de ${Object.keys(monthNames)[monthIndex]}`
                    },
                    response: '' // Não exibir mensagem redundante
                };
            } else {
                return {
                    status: 'error',
                    response: "Mês não reconhecido. Por favor, digite o nome do mês (ex: 'janeiro') ou o número (ex: '1')."
                };
            }
            
        default:
            return {
                status: 'error',
                response: "Ação não reconhecida."
            };
    }
};

// Funções para extrair informações das mensagens
function extractExpenseDetails(message) {
    // Valor com reconhecimento robusto
    let amount = extractMonetaryValue(message);
    if (amount === null) {
        const amountMatch = message.match(/r?\$?\s*(\d+[.,]?\d*)/i);
        amount = amountMatch ? parseFloat(amountMatch[1].replace(',', '.')) : null;
    }
    
    // Extrair data da mensagem
    let dateInfo = extractDateFromMessage(message);
    
    // Descrição com múltiplas estratégias
    let description = null;
    let personName = null;
    
    // 1) Tentar via padrão clássico "após o valor"
    const amountMatch = message.match(/r?\$?\s*(\d+[.,]?\d*)/i);
    if (amountMatch) {
        const afterAmount = message.substring(amountMatch.index + amountMatch[0].length);
        const descriptionMatch = afterAmount.match(/\s+(?:em|com|de|para|no|na)\s+(.+)/i);
        if (descriptionMatch) {
            description = descriptionMatch[1].trim();
        }
    }
    
    // 2) Se não encontrou, usar estratégia avançada (antes/depois do valor)
    if (!description && amount !== null) {
        description = extractDescriptionAdvanced(message, amount);
    }
    
    // 3) Limpezas e extrações adicionais
    if (description) {
        // Remover termos de tempo comuns finais
        description = description.replace(/\b(hoje|ontem|amanhã)\b/gi, '').trim();
        // Remover palavras de moeda caso tenham ficado
        description = description.replace(/\b(reais?|real|contos?|centavos?)\b/gi, '').trim();
        // Remover sobras numéricas isoladas
        description = description.replace(/(^|\s)(\d+[.,]?\d*)(?=$|\s)/g, ' ').trim();
        
        // Extrair nome da pessoa para transações de pix
        if (message.toLowerCase().includes('pix')) {
            // Padrão "para [nome]" ou "de [nome]"
            const personMatch = message.match(/(?:para|pra)\s+([a-záàâãéèêíìîóòôõúùûç\s]+?)(?:\s+(?:do|da|no|na|hoje|ontem|amanhã|reais?|real|contos?|centavos?|$))/i);
            if (personMatch) {
                personName = personMatch[1].trim();
                // Remover o nome da pessoa da descrição
                description = description.replace(new RegExp(`(?:para|pra)\\s+${personMatch[1].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i'), '').trim();
            }
        } else {
            // Padrão genérico para outras transações
            const personMatch = description.match(/(?:de|com)\s+([a-záàâãéèêíìîóòôõúùûç\s]+?)(?:\s+(?:me\s+)?(?:pagou|pago|recebeu|recebido|deveu|deve))/i);
            if (personMatch) {
                personName = personMatch[1].trim();
                description = description.replace(personMatch[0], '').trim();
            }
        }
        // Se após limpeza a descrição ficou vazia ou muito genérica, tentar trecho antes do valor
        if (!description || /^$/.test(description)) {
            if (amount !== null) {
                const amountRegex = new RegExp(`(.+?)\\s+(?:r?\\$?\\s*${amount}(?:[.,]?\\d*)?(?:\\s*(?:reais?|real|contos?))?)`, 'i');
                const beforeMatch = message.match(amountRegex);
                if (beforeMatch && beforeMatch[1]) {
                    let candidate = beforeMatch[1].trim();
                    candidate = candidate.replace(/^\b(paguei|gastei|comprei|pago|pagar|paguei\s+(a|o)|gastei\s+(com|em))\b\s*/i, '').trim();
                    candidate = candidate.replace(/^\b(a|o|um|uma)\b\s*/i, '').trim();
                    description = candidate.length > 0 ? candidate : description;
                }
            }
        }
    } else {
        // 4) Último recurso: tentar capturar trecho antes do valor como descrição
        if (amount !== null) {
            const amountRegex = new RegExp(`(.+?)\\s+(?:r?\\$?\\s*${amount}(?:[.,]?\\d*)?(?:\\s*(?:reais?|real|contos?))?)`, 'i');
            const beforeMatch = message.match(amountRegex);
            if (beforeMatch && beforeMatch[1]) {
                let candidate = beforeMatch[1].trim();
                // Remover verbos comuns no início
                candidate = candidate.replace(/^\b(paguei|gastei|comprei|pago|pagar|paguei\s+(a|o)|gastei\s+(com|em))\b\s*/i, '').trim();
                // Remover artigos no início
                candidate = candidate.replace(/^\b(a|o|um|uma)\b\s*/i, '').trim();
                description = candidate.length > 0 ? candidate : null;
            }
        }
    }
    
    return {
        amount,
        description,
        personName,
        dateInfo,
        originalMessage: message
    };
}

// Função para extrair detalhes de contas fixas mensais
function extractFixedBillDetails(message) {
    const lowerMsg = message.toLowerCase();
    
    // Extrair valor
    let amount = extractMonetaryValue(message);
    if (amount === null) {
        const amountMatch = message.match(/r?\$?\s*(\d+[.,]?\d*)/i);
        amount = amountMatch ? parseFloat(amountMatch[1].replace(',', '.')) : null;
    }
    
    // Extrair nome da conta fixa
    let name = null;
    
    // 1) Tentar extrair nome antes do valor
    if (amount !== null) {
        const amountRegex = new RegExp(`(.+?)\\s+(?:r?\\$?\\s*${amount}(?:[.,]?\\d*)?(?:\\s*(?:reais?|real|contos?))?)`, 'i');
        const beforeMatch = message.match(amountRegex);
        if (beforeMatch && beforeMatch[1]) {
            let candidate = beforeMatch[1].trim();
            // Remover artigos e preposições comuns
            candidate = candidate.replace(/^\b(a|o|um|uma|de|da|do|em|no|na)\b\s*/i, '').trim();
            if (candidate.length > 0) {
                name = candidate;
            }
        }
    }
    
    // 2) Se não encontrou, tentar extrair de palavras-chave específicas
    if (!name) {
        const fixedBillKeywords = [
            'aluguel', 'condomínio', 'internet', 'energia', 'água', 'gás', 'telefone', 'celular',
            'assinatura', 'netflix', 'spotify', 'prime', 'disney', 'hbo', 'youtube'
        ];
        
        for (const keyword of fixedBillKeywords) {
            if (lowerMsg.includes(keyword)) {
                name = keyword;
                break;
            }
        }
    }
    
    // 3) Se ainda não encontrou, usar a primeira palavra significativa
    if (!name) {
        const words = message.split(/\s+/);
        for (const word of words) {
            if (word.length > 2 && !/\d/.test(word) && !['reais', 'real', 'r$', 'todo', 'mês', 'dia'].includes(word.toLowerCase())) {
                name = word;
                break;
            }
        }
    }
    
    // Extrair dia do mês
    let dueDay = null;
    const dayMatch = message.match(/dia\s+(\d{1,2})/i);
    if (dayMatch) {
        dueDay = parseInt(dayMatch[1]);
    }
    
    // Extrair frequência
    let frequency = 'monthly'; // Padrão mensal
    if (lowerMsg.includes('semanal') || lowerMsg.includes('toda semana')) {
        frequency = 'weekly';
    } else if (lowerMsg.includes('quinzenal') || lowerMsg.includes('a cada 15 dias')) {
        frequency = 'biweekly';
    } else if (lowerMsg.includes('anual') || lowerMsg.includes('todo ano')) {
        frequency = 'yearly';
    }
    
    // Extrair categoria baseada no nome
    let category = 'utilities';
    if (name) {
        const lowerName = name.toLowerCase();
        if (['aluguel', 'condomínio'].includes(lowerName)) {
            category = 'housing';
        } else if (['internet', 'telefone', 'celular', 'netflix', 'spotify', 'prime', 'disney', 'hbo', 'youtube'].includes(lowerName)) {
            category = 'entertainment';
        } else if (['energia', 'água', 'gás'].includes(lowerName)) {
            category = 'utilities';
        } else if (['assinatura'].includes(lowerName)) {
            category = 'subscriptions';
        }
    }
    
    return {
        name,
        amount,
        dueDay,
        frequency,
        category,
        originalMessage: message
    };
}

function extractIncomeDetails(message) {
    // Valor robusto
    let amount = extractMonetaryValue(message);
    if (amount === null) {
        const amountMatch = message.match(/r?\$?\s*(\d+[.,]?\d*)/i);
        amount = amountMatch ? parseFloat(amountMatch[1].replace(',', '.')) : null;
    }
    
    // Extrair data da mensagem
    let dateInfo = extractDateFromMessage(message);
    
    // Descrição
    let description = null;
    let personName = null;
    
    // 1) Após o valor
    const amountMatch = message.match(/r?\$?\s*(\d+[.,]?\d*)/i);
    if (amountMatch) {
        const afterAmount = message.substring(amountMatch.index + amountMatch[0].length);
        const descriptionMatch = afterAmount.match(/\s+(?:de|com|para|no|na)\s+(.+)/i);
        if (descriptionMatch) {
            description = descriptionMatch[1].trim();
        }
    }
    
    // 2) Estratégia avançada (antes/depois)
    if (!description && amount !== null) {
        description = extractDescriptionAdvanced(message, amount);
    }
    
    // 3) Limpeza e pessoa
    if (description) {
        description = description.replace(/\b(hoje|ontem|amanhã)\b/gi, '').trim();
        description = description.replace(/\b(reais?|real|contos?|centavos?)\b/gi, '').trim();
        description = description.replace(/(^|\s)(\d+[.,]?\d*)(?=$|\s)/g, ' ').trim();
        const personMatch = description.match(/(?:de|com)\s+([a-záàâãéèêíìîóòôõúùûç\s]+?)(?:\s+(?:me\s+)?(?:pagou|pago|recebeu|recebido|deveu|deve))/i);
        if (personMatch) {
            personName = personMatch[1].trim();
            description = description.replace(personMatch[0], '').trim();
        }
        if (!description || /^$/.test(description)) {
            if (amount !== null) {
                const amountRegex = new RegExp(`(.+?)\\s+(?:r?\\$?\\s*${amount}(?:[.,]?\\d*)?(?:\\s*(?:reais?|real|contos?))?)`, 'i');
                const beforeMatch = message.match(amountRegex);
                if (beforeMatch && beforeMatch[1]) {
                    let candidate = beforeMatch[1].trim();
                    candidate = candidate.replace(/^\b(recebi|ganhei|entrou|depositaram|caiu|recebemos)\b\s*/i, '').trim();
                    candidate = candidate.replace(/^\b(a|o|um|uma)\b\s*/i, '').trim();
                    description = candidate.length > 0 ? candidate : description;
                }
            }
        }
    } else {
        // 4) Tentar trecho antes do valor
        if (amount !== null) {
            const amountRegex = new RegExp(`(.+?)\\s+(?:r?\\$?\\s*${amount}(?:[.,]?\\d*)?(?:\\s*(?:reais?|real|contos?))?)`, 'i');
            const beforeMatch = message.match(amountRegex);
            if (beforeMatch && beforeMatch[1]) {
                let candidate = beforeMatch[1].trim();
                candidate = candidate.replace(/^\b(recebi|ganhei|entrou|depositaram|caiu|recebemos)\b\s*/i, '').trim();
                candidate = candidate.replace(/^\b(a|o|um|uma)\b\s*/i, '').trim();
                description = candidate.length > 0 ? candidate : null;
            }
        }
    }
    
    return {
        amount,
        description,
        personName,
        dateInfo,
        originalMessage: message
    };
}

function extractPixQueryDetails(message) {
    console.log('🔍 extractPixQueryDetails chamado com:', message);
    
    // Extrair nome da pessoa
    let personName = null;
    const personMatch = message.match(/(?:para|pra|com)\s+([a-záàâãéèêíìîóòôõúùûç\s]+?)(?:\s+(?:do|da|no|na|hoje|ontem|amanhã|reais?|real|contos?|centavos?|$|\?))/i);
    if (personMatch) {
        personName = personMatch[1].trim();
        console.log('🔍 Nome da pessoa extraído:', personName);
    }
    
    // Extrair valor (se mencionado)
    let amount = null;
    const amountMatch = message.match(/(\d+[.,]?\d*)/i);
    if (amountMatch) {
        amount = parseFloat(amountMatch[1].replace(',', '.'));
        console.log('🔍 Valor extraído:', amount);
    }
    
    // Extrair período
    let period = 'today';
    if (message.toLowerCase().includes('ontem')) {
        period = 'yesterday';
    } else if (message.toLowerCase().includes('hoje')) {
        period = 'today';
    } else if (message.toLowerCase().includes('semana')) {
        period = 'week';
    } else if (message.toLowerCase().includes('mês') || message.toLowerCase().includes('mes')) {
        period = 'month';
    }
    
    return { personName, amount, period };
}

function extractTransferDetails(message, userAccounts) {
    console.log('🔍 extractTransferDetails chamado com:', message);
    
    const amountMatch = message.match(/(\d+[.,]?\d*)/i);
    const amount = amountMatch ? parseFloat(amountMatch[1].replace(',', '.')) : null;
    console.log('🔍 Valor extraído:', amount);
    
    // Extrair data da mensagem
    let dateInfo = extractDateFromMessage(message);
    
    // Verificar se userAccounts é válido
    if (!userAccounts || !Array.isArray(userAccounts)) {
        console.warn('⚠️ userAccounts é inválido em extractTransferDetails:', userAccounts);
        return { amount, fromAccount: null, toAccount: null };
    }
    
    console.log('🔍 Contas disponíveis:', userAccounts.map(acc => acc.name));
    
    // Extrair conta de origem usando a função melhorada
    const fromAccountResult = extractSourceAccount(message, userAccounts);
    console.log('🔍 Resultado da conta de origem:', fromAccountResult);
    let fromAccount = null;
    
    if (fromAccountResult.status === 'success') {
        fromAccount = userAccounts.find(acc => acc.id === fromAccountResult.accountId);
        console.log('🔍 Conta de origem encontrada:', fromAccount?.name);
    } else if (fromAccountResult.status === 'clarification') {
        // Se precisa de esclarecimento, retornar para o usuário escolher
        return {
            amount,
            fromAccount: null,
            toAccount: null,
            needsClarification: true,
            clarificationData: fromAccountResult
        };
    }
    
    // Extrair conta de destino usando a função melhorada
    const toAccountResult = extractDestinationAccount(message, userAccounts, fromAccount?.id);
    console.log('🔍 Resultado da conta de destino:', toAccountResult);
    let toAccount = null;
    
    if (toAccountResult.status === 'success') {
        toAccount = userAccounts.find(acc => acc.id === toAccountResult.accountId);
        console.log('🔍 Conta de destino encontrada:', toAccount?.name);
    } else if (toAccountResult.status === 'clarification') {
        // Se precisa de esclarecimento, retornar para o usuário escolher
        return {
            amount,
            fromAccount,
            toAccount: null,
            needsClarification: true,
            clarificationData: toAccountResult
        };
    }
    
    // Se não encontrou com as funções inteligentes, tentar método antigo como fallback
    if (!fromAccount || !toAccount) {
        console.log('🔍 Usando fallback para encontrar contas...');
        
        // Buscar por nomes de contas no texto
        const foundAccounts = [];
        
        for (const account of userAccounts) {
            if (account && account.name && message.toLowerCase().includes(account.name.toLowerCase())) {
                foundAccounts.push(account);
                console.log('🔍 Conta encontrada no texto:', account.name);
            }
        }
        
        console.log('🔍 Total de contas encontradas no texto:', foundAccounts.length);
        
        // Se encontrou exatamente duas contas, usar elas
        if (foundAccounts.length === 2) {
            // Usar o padrão "de X para Y" para determinar a ordem correta
            const deParaMatch = message.match(/(?:de|da|do)\s+(.+?)\s+(?:para|pra)\s+(.+?)(?:\s|$)/i);
            if (deParaMatch) {
                const fromName = deParaMatch[1].trim();
                const toName = deParaMatch[2].trim();
                console.log('🔍 Padrão "de X para Y" encontrado:', fromName, '->', toName);
                
                // Encontrar a conta de origem baseada no padrão "de X"
                // Remover palavras como "conta", "banco", etc. para melhor matching
                const cleanFromName = fromName.replace(/(?:conta|banco|cartão)\s+/gi, '').trim();
                console.log('🔍 Nome limpo para origem:', cleanFromName);
                
                // Ordenar as contas encontradas por especificidade (mais longas primeiro)
                const sortedAccounts = [...foundAccounts].sort((a, b) => b.name.length - a.name.length);
                
                fromAccount = sortedAccounts.find(acc => 
                    acc.name.toLowerCase().includes(cleanFromName.toLowerCase()) ||
                    cleanFromName.toLowerCase().includes(acc.name.toLowerCase())
                );
                
                // Encontrar a conta de destino baseada no padrão "para Y"
                const cleanToName = toName.replace(/(?:conta|banco|cartão)\s+/gi, '').trim();
                console.log('🔍 Nome limpo para destino:', cleanToName);
                
                // Para o destino, excluir a conta de origem e ordenar por especificidade
                const availableDestAccounts = sortedAccounts.filter(acc => acc.id !== fromAccount?.id);
                toAccount = availableDestAccounts.find(acc => 
                    acc.name.toLowerCase().includes(cleanToName.toLowerCase()) ||
                    cleanToName.toLowerCase().includes(acc.name.toLowerCase())
                );
                
                console.log('🔍 Contas encontradas pelo padrão:', fromAccount?.name, '->', toAccount?.name);
            } else {
                // Se não encontrou o padrão, usar a primeira e segunda contas encontradas
                fromAccount = foundAccounts[0];
                toAccount = foundAccounts[1];
                console.log('🔍 Usando as duas contas encontradas na ordem:', fromAccount.name, '->', toAccount.name);
            }
        }
        // Se encontrou mais de duas contas, tentar pelo padrão "de X para Y"
        else if (foundAccounts.length > 2) {
            const deParaMatch = message.match(/(?:de|da|do)\s+(.+?)\s+(?:para|pra)\s+(.+?)(?:\s|$)/i);
            if (deParaMatch) {
                const fromName = deParaMatch[1].trim();
                const toName = deParaMatch[2].trim();
                console.log('🔍 Padrão "de X para Y" encontrado:', fromName, '->', toName);
                
                // Remover palavras como "conta", "banco", etc. para melhor matching
                const cleanFromName = fromName.replace(/(?:conta|banco|cartão)\s+/gi, '').trim();
                const cleanToName = toName.replace(/(?:conta|banco|cartão)\s+/gi, '').trim();
                
                // Ordenar as contas encontradas por especificidade (mais longas primeiro)
                const sortedAccounts = [...foundAccounts].sort((a, b) => b.name.length - a.name.length);
                
                fromAccount = sortedAccounts.find(acc =>
                    acc.name.toLowerCase().includes(cleanFromName.toLowerCase()) ||
                    cleanFromName.toLowerCase().includes(acc.name.toLowerCase())
                );
                
                // Para o destino, excluir a conta de origem e ordenar por especificidade
                const availableDestAccounts = sortedAccounts.filter(acc => acc.id !== fromAccount?.id);
                toAccount = availableDestAccounts.find(acc =>
                    acc.name.toLowerCase().includes(cleanToName.toLowerCase()) ||
                    cleanToName.toLowerCase().includes(acc.name.toLowerCase())
                );
                
                console.log('🔍 Contas encontradas pelo padrão:', fromAccount?.name, '->', toAccount?.name);
            }
        }
    }
    
    console.log('🔍 Resultado final:', { 
        amount, 
        fromAccount: fromAccount?.name, 
        toAccount: toAccount?.name 
    });
    
    return { amount, fromAccount, toAccount, dateInfo };
}

function extractPeriodFromMessage(message) {
    // Usar a função parseTimePeriod que já reconhece "ontem", "hoje", etc.
    console.log('🔍 extractPeriodFromMessage chamado com:', message);
    const timeResult = parseTimePeriod(message);
    console.log('🔍 parseTimePeriod retornou:', timeResult);
    if (timeResult) {
        return timeResult;
    }
    
    const now = new Date();
    let period = '';
    let startDate = null;
    let endDate = null;
    
    if (message.includes('este mês') || message.includes('mês atual')) {
        period = 'este mês';
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    } else if (message.includes('última semana') || message.includes('semana passada')) {
        period = 'última semana';
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        endDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    } else if (message.includes('janeiro')) {
        period = 'janeiro';
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 1, 0);
    } else if (message.includes('fevereiro')) {
        period = 'fevereiro';
        startDate = new Date(now.getFullYear(), 1, 1);
        endDate = new Date(now.getFullYear(), 2, 0);
    } else if (message.includes('março')) {
        period = 'março';
        startDate = new Date(now.getFullYear(), 2, 1);
        endDate = new Date(now.getFullYear(), 3, 0);
    } else if (message.includes('abril')) {
        period = 'abril';
        startDate = new Date(now.getFullYear(), 3, 1);
        endDate = new Date(now.getFullYear(), 4, 0);
    } else if (message.includes('maio')) {
        period = 'maio';
        startDate = new Date(now.getFullYear(), 4, 1);
        endDate = new Date(now.getFullYear(), 5, 0);
    } else if (message.includes('junho')) {
        period = 'junho';
        startDate = new Date(now.getFullYear(), 5, 1);
        endDate = new Date(now.getFullYear(), 6, 0);
    } else if (message.includes('julho')) {
        period = 'julho';
        startDate = new Date(now.getFullYear(), 6, 1);
        endDate = new Date(now.getFullYear(), 7, 0);
    } else if (message.includes('agosto')) {
        period = 'agosto';
        startDate = new Date(now.getFullYear(), 7, 1);
        endDate = new Date(now.getFullYear(), 8, 0);
    } else if (message.includes('setembro')) {
        period = 'setembro';
        startDate = new Date(now.getFullYear(), 8, 1);
        endDate = new Date(now.getFullYear(), 9, 0);
    } else if (message.includes('outubro')) {
        period = 'outubro';
        startDate = new Date(now.getFullYear(), 9, 1);
        endDate = new Date(now.getFullYear(), 10, 0);
    } else if (message.includes('novembro')) {
        period = 'novembro';
        startDate = new Date(now.getFullYear(), 10, 1);
        endDate = new Date(now.getFullYear(), 11, 0);
    } else if (message.includes('dezembro')) {
        period = 'dezembro';
        startDate = new Date(now.getFullYear(), 11, 1);
        endDate = new Date(now.getFullYear(), 12, 0);
    }
    
    // Se não encontrou nenhum período específico, retornar objeto vazio
    if (!period) {
        console.log('🔍 Nenhum período encontrado, retornando objeto vazio');
        return { period: '', startDate: null, endDate: null };
    }
    
    console.log('🔍 Período encontrado:', period, 'startDate:', startDate, 'endDate:', endDate);
    return { period, startDate, endDate };
}

function selectDefaultAccount(userAccounts) {
    // Verificar se userAccounts é válido
    if (!userAccounts || !Array.isArray(userAccounts)) {
        console.warn('⚠️ userAccounts é inválido em selectDefaultAccount:', userAccounts);
        return null;
    }
    
    // Se só tem uma conta, usar ela
    if (userAccounts.length === 1) {
        return userAccounts[0] && userAccounts[0].id ? userAccounts[0].id : null;
    }
    
    // Se tem múltiplas contas, não selecionar automaticamente
    return null;
}

// Função para melhorar o reconhecimento de valores monetários
function extractMonetaryValue(message) {
    const patterns = [
        /r?\$?\s*(\d+[.,]?\d*)/i,                    // R$25, R$25.50, 25, 25.50
        /(\d+[.,]?\d*)\s*reais?/i,                   // 25 reais, 25.50 reais
        /(\d+[.,]?\d*)\s*contos?/i,                  // 25 contos, 25.50 contos
        /(\d+[.,]?\d*)\s*real/i,                     // 25 real, 25.50 real
        /(\d+[.,]?\d*)\s*centavos?/i,                // 25 centavos
        /(\d+[.,]?\d*)\s*centavo/i                    // 25 centavo
    ];
    
    for (const pattern of patterns) {
        const match = message.match(pattern);
        if (match) {
            let value = parseFloat(match[1].replace(',', '.'));
            
            // Converter centavos para reais se necessário
            if (message.toLowerCase().includes('centavo')) {
                value = value / 100;
            }
            
            return value;
        }
    }
    
    return null;
}

// Função para melhorar o reconhecimento de descrições
function extractDescriptionAdvanced(message, amount) {
    const lowerMsg = message.toLowerCase();
    let description = null;
    
    // Remover o valor da mensagem para extrair a descrição
    let cleanMessage = lowerMsg.replace(new RegExp(`r?\\$?\\s*${amount}[.,]?\\d*`, 'gi'), '');
    
    // Buscar por preposições que indicam descrição
    const descriptionPatterns = [
        /(?:em|com|de|para|no|na|sobre|referente\s+a)\s+(.+)/i,
        /(.+?)(?:\s+(?:da\s+conta|no|na|com|para))/i
    ];
    
    for (const pattern of descriptionPatterns) {
        const match = cleanMessage.match(pattern);
        if (match && match[1]) {
            description = match[1].trim();
            
            // Limpar palavras desnecessárias
            description = description.replace(/\b(da conta|no|na|com|para|de|do|da|em|sobre|referente a)\b/gi, '').trim();
            
            if (description.length > 0) {
                break;
            }
        }
    }
    
    // Se não encontrou com padrões, tentar extrair o que vem após o valor
    if (!description) {
        const amountIndex = lowerMsg.indexOf(amount.toString());
        if (amountIndex !== -1) {
            const afterAmount = message.substring(amountIndex + amount.toString().length);
            const words = afterAmount.trim().split(/\s+/);
            
            // Filtrar palavras relevantes
            const relevantWords = words.filter(word => 
                word.length > 2 && 
                !['em', 'com', 'de', 'para', 'no', 'na', 'da', 'do', 'da'].includes(word.toLowerCase())
            );
            
            if (relevantWords.length > 0) {
                description = relevantWords.join(' ');
            }
        }
    }
    
    return description || null;
}

// Função para validar nomes de contas duplicados
function validateAccountName(accountName, userAccounts) {
    if (!accountName || accountName.trim() === '') {
        return { isValid: false, error: 'Nome da conta não pode estar vazio.' };
    }
    
    if (accountName.length < 2) {
        return { isValid: false, error: 'Nome da conta deve ter pelo menos 2 caracteres.' };
    }
    
    // Verificar se userAccounts é válido
    if (!userAccounts || !Array.isArray(userAccounts)) {
        console.warn('⚠️ userAccounts é inválido:', userAccounts);
        return { isValid: true }; // Permitir criação se não conseguir validar
    }
    
    // Verificar se já existe uma conta com nome EXATO (case-insensitive)
    const exactMatch = userAccounts.find(acc => 
        acc && acc.name && acc.name.toLowerCase() === accountName.toLowerCase()
    );
    
    if (exactMatch) {
        return { 
            isValid: false, 
            error: `Já existe uma conta chamada "${exactMatch.name}". Use um nome diferente.`,
            suggestion: `Exemplo: "Nubank Pessoal" vs "Nubank Empresarial"`
        };
    }
    
    // Verificar se há conflitos com nomes muito similares que podem causar confusão
    const similarAccounts = userAccounts.filter(acc => {
        if (!acc || !acc.name) return false;
        
        const existingName = acc.name.toLowerCase();
        const newName = accountName.toLowerCase();
        
        // Se um nome é completamente contido no outro, pode ser confuso
        if (existingName.includes(newName) || newName.includes(existingName)) {
            // Mas permitir se a diferença for significativa (mais de 3 caracteres)
            const difference = Math.abs(existingName.length - newName.length);
            if (difference <= 3) {
                // Verificar se são claramente diferentes (ex: "Nubank" vs "Nubank Empresarial")
                const words1 = existingName.split(/\s+/);
                const words2 = newName.split(/\s+/);
                
                // Se ambos têm mais de uma palavra, permitir
                if (words1.length > 1 || words2.length > 1) {
                    return false; // Não é conflito
                }
                
                // Se um é muito similar ao outro, pode ser confuso
                return true;
            }
        }
        
        return false;
    });
    
    if (similarAccounts.length > 0) {
        const conflictingAccount = similarAccounts[0];
        return { 
            isValid: false, 
            error: `O nome "${accountName}" é muito similar a "${conflictingAccount.name}" e pode causar confusão.`,
            suggestion: `Use um nome mais específico como "${accountName} Pessoal" ou "${accountName} Empresarial"`
        };
    }
    
    return { isValid: true };
}

// Função para extrair datas passadas das mensagens
function extractDateFromMessage(message) {
    const lowerMsg = message.toLowerCase();
    const now = new Date();
    
    // Verificar se menciona "ontem"
    if (lowerMsg.includes('ontem')) {
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        return {
            date: yesterday,
            type: 'yesterday',
            message: 'ontem'
        };
    }
    
    // Verificar se menciona "hoje"
    if (lowerMsg.includes('hoje')) {
        return {
            date: now,
            type: 'today',
            message: 'hoje'
        };
    }
    
    // Verificar se menciona "amanhã"
    if (lowerMsg.includes('amanhã') || lowerMsg.includes('amanha')) {
        const tomorrow = new Date(now);
        tomorrow.setDate(now.getDate() + 1);
        return {
            date: tomorrow,
            type: 'tomorrow',
            message: 'amanhã'
        };
    }
    
    // Verificar se menciona dias específicos da semana
    const weekDays = {
        'domingo': 0, 'segunda': 1, 'segunda-feira': 1, 'terça': 2, 'terça-feira': 2, 'terca': 2, 'terca-feira': 2,
        'quarta': 3, 'quarta-feira': 3, 'quinta': 4, 'quinta-feira': 4, 'sexta': 5, 'sexta-feira': 5,
        'sábado': 6, 'sabado': 6, 'sábado-feira': 6, 'sabado-feira': 6
    };
    
    for (const [dayName, dayIndex] of Object.entries(weekDays)) {
        if (lowerMsg.includes(dayName)) {
            const targetDate = new Date(now);
            const currentDay = now.getDay();
            const daysToAdd = (dayIndex - currentDay + 7) % 7;
            targetDate.setDate(now.getDate() + daysToAdd);
            
            return {
                date: targetDate,
                type: 'weekday',
                message: dayName
            };
        }
    }
    
    // Verificar se menciona datas específicas do calendário
    // Padrões: "dia 10/08/2025", "10/08/2025", "10-08-2025", "10.08.2025"
    const calendarDatePatterns = [
        /(?:dia\s+)?(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/i, // dia 10/08/2025, 10/08/2025
        /(?:dia\s+)?(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2})/i, // dia 10/08/25, 10/08/25
        /(?:dia\s+)?(\d{1,2})\s+de\s+(\d{1,2})\s+de\s+(\d{4})/i, // dia 10 de 08 de 2025
        /(?:dia\s+)?(\d{1,2})\s+de\s+(\d{1,2})\s+de\s+(\d{2})/i  // dia 10 de 08 de 25
    ];
    
    for (const pattern of calendarDatePatterns) {
        const match = lowerMsg.match(pattern);
        if (match) {
            let day = parseInt(match[1]);
            let month = parseInt(match[2]) - 1; // Mês começa em 0 no JavaScript
            let year = parseInt(match[3]);
            
            // Se o ano tem apenas 2 dígitos, assumir século 21
            if (year < 100) {
                year += 2000;
            }
            
            // Validar a data
            const targetDate = new Date(year, month, day);
            if (targetDate.getDate() === day && targetDate.getMonth() === month && targetDate.getFullYear() === year) {
                // Verificar se é uma data passada
                if (targetDate < now) {
                    return {
                        date: targetDate,
                        type: 'past_date',
                        message: `dia ${day.toString().padStart(2, '0')}/${(month + 1).toString().padStart(2, '0')}/${year}`
                    };
                } else if (targetDate.getTime() === now.getTime()) {
                    return {
                        date: targetDate,
                        type: 'today',
                        message: 'hoje'
                    };
                } else {
                    return {
                        date: targetDate,
                        type: 'future_date',
                        message: `dia ${day.toString().padStart(2, '0')}/${(month + 1).toString().padStart(2, '0')}/${year}`
                    };
                }
            }
        }
    }
    
    // Nenhuma data encontrada
    return null;
}

// Função para extrair horário das mensagens
function extractTimeFromMessage(message) {
    const lowerMsg = message.toLowerCase();
    
    // Padrões de horário: 18:00, 18 horas, 18, 18horas, 18,00
    const timePatterns = [
        /(\d{1,2}):(\d{2})/, // 18:00
        /(\d{1,2})\s*horas?/, // 18 horas
        /(\d{1,2})\s*[,.]\s*(\d{2})/, // 18,00 ou 18.00
        /^(\d{1,2})$/, // 18 (isolado)
        /(\d{1,2})\s*hrs?/, // 18hrs
        /(\d{1,2})\s*h/ // 18h
    ];
    
    for (const pattern of timePatterns) {
        const match = lowerMsg.match(pattern);
        if (match) {
            let hours = parseInt(match[1]);
            let minutes = 0;
            
            // Se tem minutos (padrão 18:00 ou 18,00)
            if (match[2]) {
                minutes = parseInt(match[2]);
            }
            
            // Validar horário
            if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
                return {
                    hours: hours,
                    minutes: minutes,
                    formatted: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
                };
            }
        }
    }
    
    return null;
}

// Função para identificar banco a partir de texto
function identifyBank(text) {
    const lowerText = text.toLowerCase().trim();
    
    for (const [bankKey, bankInfo] of Object.entries(BANK_KNOWLEDGE)) {
        for (const name of bankInfo.names) {
            if (lowerText.includes(name)) {
                return {
                    id: bankKey,
                    name: bankInfo.names[0],
                    type: bankInfo.type,
                    category: bankInfo.category,
                    originalText: text
                };
            }
        }
    }
    
    return null;
}

// Função para identificar conta fixa a partir de texto
// 🔧 NOVA LÓGICA: Detecta automaticamente qualquer conta fixa registrada no sistema
async function identifyFixedBill(text, userFixedBills = []) {
    const lowerText = text.toLowerCase().trim();
    
    console.log('🔍 Identificando conta fixa em:', text);
    
    try {
        // 🔧 PRIMEIRO: Buscar nas contas fixas registradas no sistema (prioridade máxima)
        if (userFixedBills && userFixedBills.length > 0) {
            console.log('🔍 Verificando nas contas fixas registradas do usuário...');
            
            for (const userBill of userFixedBills) {
                const userBillName = userBill.name.toLowerCase();
                
                // Verificar se o texto contém o nome exato da conta fixa
                if (lowerText.includes(userBillName)) {
                    console.log('🔍 ✅ Conta fixa do usuário encontrada:', userBill.name);
                    return {
                        id: userBill.id || userBill.name,
                        name: userBill.name,
                        category: userBill.category || 'personal',
                        commonAmounts: [userBill.amount],
                        dueDays: [userBill.dueDay || 10],
                        originalText: text,
                        isUserBill: true,
                        userBillData: userBill
                    };
                }
                
                // Verificar se o texto contém parte do nome da conta fixa
                if (userBillName.includes(lowerText) || lowerText.includes(userBillName)) {
                    console.log('🔍 ✅ Conta fixa do usuário encontrada (match parcial):', userBill.name);
                    return {
                        id: userBill.id || userBill.name,
                        name: userBill.name,
                        category: userBill.category || 'personal',
                        commonAmounts: [userBill.amount],
                        dueDays: [userBill.dueDay || 10],
                        originalText: text,
                        isUserBill: true,
                        userBillData: userBill
                    };
                }
            }
        }
        
        // 🔧 SEGUNDO: Se não encontrou nas contas do usuário, usar a base de conhecimento como fallback
        for (const [billKey, billInfo] of Object.entries(FIXED_BILLS_KNOWLEDGE)) {
            for (const synonym of billInfo.synonyms) {
                if (lowerText.includes(synonym)) {
                    console.log('🔍 Conta fixa encontrada na base de conhecimento:', billKey, 'via sinônimo:', synonym);
                    return {
                        id: billKey,
                        name: billInfo.synonyms[0],
                        category: billInfo.category,
                        commonAmounts: billInfo.commonAmounts,
                        dueDays: billInfo.dueDays,
                        originalText: text,
                        isUserBill: false
                    };
                }
            }
        }
        
        // Verificar se contém apenas o nome de uma conta fixa comum (ex: "internet", "aluguel")
        const commonFixedBills = ['aluguel', 'condomínio', 'internet', 'energia', 'água', 'gás', 'netflix', 'spotify'];
        for (const bill of commonFixedBills) {
            if (lowerText.includes(bill)) {
                console.log('🔍 Conta fixa comum encontrada na base de conhecimento:', bill);
                // Buscar na base de conhecimento
                if (FIXED_BILLS_KNOWLEDGE[bill]) {
                    return {
                        id: bill,
                        name: bill,
                        category: FIXED_BILLS_KNOWLEDGE[bill].category,
                        commonAmounts: FIXED_BILLS_KNOWLEDGE[bill].commonAmounts,
                        dueDays: FIXED_BILLS_KNOWLEDGE[bill].dueDays,
                        originalText: text,
                        isUserBill: false
                    };
                }
            }
        }
        
        console.log('🔍 Nenhuma conta fixa identificada em:', text);
        return null;
        
    } catch (error) {
        console.error('❌ Erro ao identificar conta fixa:', error);
        return null;
    }
}

// Função para verificar se uma mensagem indica pagamento de conta fixa
// 🔧 NOVA LÓGICA: Detecta automaticamente qualquer conta fixa registrada no sistema
async function isFixedBillPayment(message, userFixedBills = []) {
    const lowerMsg = message.toLowerCase();
    
    // Palavras que indicam pagamento
    const paymentWords = ['paguei', 'paguei', 'pago', 'pago', 'quitado', 'quitado', 'liquidado', 'liquidado'];
    
    // Verificar se contém palavra de pagamento
    const hasPaymentWord = paymentWords.some(word => lowerMsg.includes(word));
    
    if (!hasPaymentWord) return false;
    
    // 🔧 NOVA LÓGICA: Verificar se menciona alguma conta fixa (registrada ou conhecida)
    try {
        const identifiedBill = await identifyFixedBill(message, userFixedBills);
        if (identifiedBill) {
            console.log('🔍 ✅ Conta fixa identificada:', identifiedBill);
            return true;
        }
        
        // 🔧 FALLBACK: Verificar se contém padrões de conta fixa conhecida
        const fixedBillPatterns = [
            /\b(aluguel|condomínio|internet|energia|água|gás|netflix|spotify)\b/i,
            /\b(conta|fatura|boleto)\s+(de\s+)?(aluguel|condomínio|internet|energia|água|gás|netflix|spotify)\b/i
        ];
        
        const hasFixedBillPattern = fixedBillPatterns.some(pattern => pattern.test(message));
        if (hasFixedBillPattern) {
            console.log('🔍 Padrão de conta fixa conhecida encontrado na mensagem:', message);
            return true;
        }
        
        return false;
        
    } catch (error) {
        console.error('❌ Erro ao verificar pagamento de conta fixa:', error);
        return false;
    }
}

// Função para extrair informações de pagamento de conta fixa
// 🔧 NOVA LÓGICA: Extrai informações de qualquer conta fixa registrada no sistema
async function extractFixedBillPaymentInfo(message, userFixedBills = []) {
    const lowerMsg = message.toLowerCase();
    
    // 🔧 NOVA LÓGICA: Identificar a conta fixa (registrada ou conhecida)
    const identifiedBill = await identifyFixedBill(message, userFixedBills);
    if (!identifiedBill) return null;
    
    // Extrair valor (se mencionado)
    let amount = extractMonetaryValue(message);
    
    // 🔧 NOVA LÓGICA: Se não mencionou valor mas é uma conta fixa do usuário, usar o valor registrado
    if (!amount && identifiedBill.isUserBill && identifiedBill.userBillData) {
        amount = identifiedBill.userBillData.amount;
        console.log('🔍 💰 Usando valor da conta fixa registrada:', amount);
    }
    
    // Extrair banco usado para pagamento
    const bank = identifyBank(message);
    
    // Extrair data (se mencionada)
    let date = extractDateFromMessage(message);
    
    return {
        bill: identifiedBill,
        amount: amount,
        bank: bank,
        date: date,
        originalMessage: message
    };
}

// Função para extrair banco mencionado na mensagem
function extractBankFromMessage(message) {
    const messageLower = message.toLowerCase();
    
    // Buscar por padrões como "com nubank", "pelo nubank", "via nubank", etc.
    for (const [bankKey, bankInfo] of Object.entries(BANK_KNOWLEDGE)) {
        for (const bankName of bankInfo.names) {
            const patterns = [
                new RegExp(`(?:com|pelo|via|no|na|pelo|através do|através da)\\s+${bankName.replace(/\s+/g, '\\s+')}`, 'i'),
                new RegExp(`${bankName.replace(/\s+/g, '\\s+')}\\s+(?:card|cartão|conta)`, 'i'),
                new RegExp(`(?:paguei|gastei|usei)\\s+(?:com|pelo|via|no|na)\\s+${bankName.replace(/\s+/g, '\\s+')}`, 'i')
            ];
            
            for (const pattern of patterns) {
                if (pattern.test(messageLower)) {
                    return bankKey;
                }
            }
        }
    }
    
    return null;
}

// Função para buscar contas fixas que correspondem ao nome mencionado
function findMatchingFixedBills(billName, fixedBills = []) {
    if (!billName || !Array.isArray(fixedBills)) {
        return [];
    }
    
    const billNameLower = billName.toLowerCase();
    const matchingBills = [];
    
    for (const bill of fixedBills) {
        if (!bill || !bill.name) continue;
        
        const billNameLower2 = bill.name.toLowerCase();
        
        // Verificação exata
        if (billNameLower2 === billNameLower) {
            matchingBills.push(bill);
            continue;
        }
        
        // Verificação por similaridade
        if (billNameLower2.includes(billNameLower) || billNameLower.includes(billNameLower2)) {
            matchingBills.push(bill);
            continue;
        }
        
        // Verificação por sinônimos conhecidos
        const billInfo = FIXED_BILLS_KNOWLEDGE[billNameLower];
        if (billInfo && billInfo.synonyms) {
            for (const synonym of billInfo.synonyms) {
                if (billNameLower2.includes(synonym.toLowerCase())) {
                    matchingBills.push(bill);
                    break;
                }
            }
        }
        
        // Verificação por similaridade de palavras-chave
        const billKeywords = billNameLower.split(/\s+/);
        const billNameKeywords = billNameLower2.split(/\s+/);
        
        let keywordMatches = 0;
        for (const keyword of billKeywords) {
            if (keyword.length > 2) { // Ignorar palavras muito curtas
                for (const billKeyword of billNameKeywords) {
                    if (billKeyword.length > 2 && billKeyword.includes(keyword)) {
                        keywordMatches++;
                        break;
                    }
                }
            }
        }
        
        // Se pelo menos 50% das palavras-chave correspondem, considerar como match
        if (keywordMatches > 0 && (keywordMatches / billKeywords.length) >= 0.5) {
            matchingBills.push(bill);
        }
    }
    
    return matchingBills;
}

// Função para encontrar conta bancária baseada no banco mencionado
export function findBankAccount(bankKey, userAccounts) {
    if (!bankKey || !userAccounts || !Array.isArray(userAccounts)) {
        return null;
    }
    
    const bankInfo = BANK_KNOWLEDGE[bankKey];
    if (!bankInfo) {
        return null;
    }
    
    // Buscar por conta que corresponda ao banco mencionado
    for (const account of userAccounts) {
        if (!account || !account.name) continue;
        
        const accountNameLower = account.name.toLowerCase();
        
        // Verificar se o nome da conta contém alguma das variações do banco
        for (const bankName of bankInfo.names) {
            if (accountNameLower.includes(bankName.toLowerCase())) {
                return account;
            }
        }
        
        // Verificar por padrões comuns de nomes de contas
        if (bankKey === 'nubank' && (accountNameLower.includes('nu') || accountNameLower.includes('roxinho'))) {
            return account;
        }
        if (bankKey === 'itau' && (accountNameLower.includes('itau') || accountNameLower.includes('itaú'))) {
            return account;
        }
        if (bankKey === 'bradesco' && accountNameLower.includes('bradesco')) {
            return account;
        }
        if (bankKey === 'santander' && accountNameLower.includes('santander')) {
            return account;
        }
        if (bankKey === 'bb' && (accountNameLower.includes('bb') || accountNameLower.includes('banco do brasil'))) {
            return account;
        }
        if (bankKey === 'caixa' && (accountNameLower.includes('caixa') || accountNameLower.includes('cef'))) {
            return account;
        }
        if (bankKey === 'inter' && accountNameLower.includes('inter')) {
            return account;
        }
        if (bankKey === 'c6' && accountNameLower.includes('c6')) {
            return account;
        }
        if (bankKey === 'picpay' && accountNameLower.includes('picpay')) {
            return account;
        }
        if (bankKey === 'mercado pago' && (accountNameLower.includes('mercado') || accountNameLower.includes('mercadopago'))) {
            return account;
        }
    }
    
    return null;
}