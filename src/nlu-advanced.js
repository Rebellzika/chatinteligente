// Sistema NLU Avançado para Dinah - Nível Profissional
// Este sistema transforma o Dinah em um assistente financeiro de nível ChatGPT

// ========================================
// SISTEMA ANTI-CONFLITO DE INTENÇÕES
// ========================================

class ConflictPreventionSystem {
    constructor() {
        // ANÁLISE DE CONFLITOS IDENTIFICADOS:
        // 1. "paguei" - conflito entre ADD_EXPENSE e PAY_FIXED_BILL
        // 2. "quanto" - conflito entre GREETING e QUERY_BALANCE
        // 3. "quais" - conflito entre GREETING e QUERY_PAID_BILLS
        // 4. "conta" - conflito entre múltiplas intenções
        // 5. "tenho" - conflito entre GREETING e QUERY_BALANCE
        
        this.contextRules = {
            // REGRA 1: ADD_EXPENSE - Despesas com valor específico
            ADD_EXPENSE: {
                required: ['valor_monetario'],
                forbidden: ['conta_fixa_especifica', 'transferencia_para_pessoa', 'conta_origem', 'conta_destino'],
                contextBoost: 3.0,
                patterns: [
                    /(?:gastei|desembolsei|apliquei|investi|comprei|saquei|retirei)\s+R?\$?\s*[\d,]+\s*(?:reais?|contos?|pila|grana|trocado|trocados)/i,
                    /(?:paguei|mandei|enviei)\s+R?\$?\s*[\d,]+\s*(?:reais?|contos?|pila|grana|trocado|trocados)\s+(?:para|no|na|em|com)/i,
                    /(?:foi|debitou)\s+R?\$?\s*[\d,]+\s*(?:reais?|contos?|pila|grana|trocado|trocados)/i,
                    /comprei\s+.+\s+(?:por|a)\s+R?\$?\s*[\d,]+/i,
                    /(?:gasolina|farmácia|farmacia|supermercado|mercado|ifood|rappi|uber|taxi)\s+R?\$?\s*[\d,]+/i
                ],
                exclusionPatterns: [
                    /paguei\s+(?:o|a)\s+(?:aluguel|energia|luz|água|agua|internet|telefone|gás|gas|condomínio|condominio|seguro|escola|cartão|cartao|streaming|academia|plano|mensalidade)/i,
                    /transferi\s+[\d,]+\s+(?:reais?|de|do)\s+(.+?)\s+para\s+(.+)/i
                ]
            },
            
            // REGRA 2: PAY_FIXED_BILL - Contas fixas específicas
            PAY_FIXED_BILL: {
                required: ['conta_fixa_especifica'],
                forbidden: ['valor_monetario_especifico', 'conta_origem', 'conta_destino'],
                contextBoost: 4.0,
                patterns: [
                    /(?:paguei|quitei|acabei de pagar)\s+(?:o|a)\s+(?:aluguel|energia|luz|água|agua|internet|telefone|gás|gas|condomínio|condominio|seguro|escola|cartão|cartao|streaming|academia|plano|mensalidade)/i,
                    /(?:paguei|quitei)\s+(?:o|a)\s+(.+?)\s+(?:com|no|na|usando|pelo|pela)\s+(.+)/i,
                    /(?:conta|boleto|fatura|prestação|prestacao|parcela)\s+(?:de|do|da)\s+(?:aluguel|energia|luz|água|agua|internet|telefone|gás|gas|condomínio|condominio|seguro|escola|cartão|cartao|streaming|academia|plano|mensalidade)/i
                ],
                exclusionPatterns: [
                    /(?:gastei|desembolsei|apliquei|investi|comprei|saquei|retirei)\s+R?\$?\s*[\d,]+/i,
                    /transferi\s+[\d,]+\s+(?:reais?|de|do)\s+(.+?)\s+para\s+(.+)/i
                ]
            },
            
            // REGRA 3: PERFORM_TRANSFER - Transferências entre contas
            PERFORM_TRANSFER: {
                required: ['conta_origem', 'conta_destino'],
                forbidden: ['conta_fixa_especifica'],
                contextBoost: 3.5,
                patterns: [
                    /(?:transferi|transfira|movi|mova|mandei|enviei|passou|movimentei|migrei|passei)\s+[\d,]+\s+(?:reais?|contos?|pila|grana|trocado|trocados)\s+(?:de|do|da)\s+(.+?)\s+para\s+(.+)/i,
                    /[\d,]+\s+(?:reais?|contos?|pila|grana|trocado|trocados)\s+(?:de|do|da)\s+(.+?)\s+para\s+(.+)/i,
                    /(?:mover|movimentar|transferir)\s+[\d,]+\s+(?:reais?|contos?|pila|grana|trocado|trocados)\s+(?:de|do|da)\s+(.+?)\s+para\s+(.+)/i
                ],
                exclusionPatterns: [
                    /(?:paguei|quitei)\s+(?:o|a)\s+(?:aluguel|energia|luz|água|agua|internet|telefone|gás|gas|condomínio|condominio|seguro|escola|cartão|cartao|streaming|academia|plano|mensalidade)/i,
                    /(?:gastei|desembolsei|apliquei|investi|comprei|saquei|retirei)\s+R?\$?\s*[\d,]+/i
                ]
            },
            
            // REGRA 4: ADD_INCOME - Receitas
            ADD_INCOME: {
                required: ['valor_monetario'],
                forbidden: ['conta_fixa_especifica', 'conta_origem', 'conta_destino'],
                contextBoost: 2.5,
                patterns: [
                    /(?:recebi|ganhei|caiu|entrou|pingou|depositei|chegou)\s+R?\$?\s*[\d,]+\s*(?:reais?|contos?|pila|grana|trocado|trocados)/i,
                    /(?:salário|salario|depósito|deposito)\s+(?:de|de\s+)?R?\$?\s*[\d,]+/i,
                    /(?:transferiram|me enviaram|me mandaram)\s+R?\$?\s*[\d,]+/i,
                    /(?:entrou|caiu|pingou)\s+(?:na|no)\s+(?:conta|banco)/i
                ],
                exclusionPatterns: [
                    /(?:gastei|desembolsei|apliquei|investi|comprei|saquei|retirei)\s+R?\$?\s*[\d,]+/i,
                    /transferi\s+[\d,]+\s+(?:reais?|de|do)\s+(.+?)\s+para\s+(.+)/i
                ]
            },
            
            // REGRA 5: ADD_DEBT - Nova dívida
            ADD_DEBT: {
                required: ['valor_monetario'],
                forbidden: ['conta_fixa_especifica', 'conta_origem', 'conta_destino'],
                contextBoost: 2.0,
                patterns: [
                    /(?:estou devendo|to devendo|devo|fiquei devendo|fiquei devendo)\s+R?\$?\s*[\d,]+\s*(?:reais?|contos?|pila|grana|trocado|trocados)/i,
                    /(?:dívida|divida|deve|devendo)\s+(?:de|de\s+)?R?\$?\s*[\d,]+/i,
                    /(?:emprestou|emprestou-me|emprestou me)\s+R?\$?\s*[\d,]+/i
                ],
                exclusionPatterns: [
                    /quanto\s+(?:estou|to|eu\s+estou|eu\s+to)\s+devendo/i,
                    /quanto\s+(?:devo|eu\s+devo)/i,
                    /minhas?\s+d[ií]vidas?/i
                ]
            },
            
            // REGRA 6: GREETING - Saudações e perguntas gerais (PRIORIDADE MÁXIMA)
            GREETING: {
                required: ['pergunta_geral', 'saudacao', 'duvida_geral'],
                forbidden: ['valor_monetario', 'conta_fixa_especifica', 'conta_origem', 'conta_destino'],
                contextBoost: 5.0, // MAIOR BOOST para evitar conflitos
                patterns: [
                    /^(oi|olá|ola|e aí|eai|eae|salve|fala|bom dia|boa tarde|boa noite)/i,
                    /(oi|olá|ola|e aí|eai|eae|salve|fala)\s+dinah/i,
                    /como\s+(você\s+)?funciona/i,
                    /quais\s+s[ãa]o\s+suas?\s+fun[çc][õo]es/i,
                    /o\s+que\s+(você\s+)?pode\s+fazer/i,
                    /quantos\s+anos/i,
                    /quantos\s+[a-z]+/i,
                    /quanto\s+[a-z]+/i,
                    /pergunta/i,
                    /d[úu]vida/i,
                    /curiosidade/i,
                    /saber/i,
                    /conhecer/i
                ],
                exclusionPatterns: [
                    /(?:gastei|desembolsei|apliquei|investi|comprei|saquei|retirei)\s+R?\$?\s*[\d,]+/i,
                    /(?:recebi|ganhei|caiu|entrou|pingou|chegou|depositei)\s+R?\$?\s*[\d,]+/i,
                    /(?:paguei|quitei)\s+(?:o|a)\s+(?:aluguel|energia|luz|água|agua|internet|telefone|gás|gas|condomínio|condominio|seguro|escola|cartão|cartao|streaming|academia|plano|mensalidade)/i,
                    /transferi\s+[\d,]+\s+(?:reais?|de|do)\s+(.+?)\s+para\s+(.+)/i,
                    /qual\s+meu\s+saldo/i,
                    /quanto\s+tenho\s+(?:no|na|em)/i,
                    /saldo\s+(?:de|do|da)/i
                ]
            }
        };
        
        this.conflictResolution = {
            // Estratégia de resolução por contexto
            contextual: (intent1, intent2, context) => {
                const contextScore1 = this.calculateContextScore(intent1, context);
                const contextScore2 = this.calculateContextScore(intent2, context);
                return contextScore1 > contextScore2 ? intent1 : intent2;
            },
            
            // Estratégia de resolução por prioridade
            priority: (intent1, intent2) => {
                const priority1 = this.getIntentPriority(intent1);
                const priority2 = this.getIntentPriority(intent2);
                return priority1 > priority2 ? intent1 : intent2;
            },
            
            // Estratégia de resolução por confiança
            confidence: (intent1, intent2) => {
                return intent1.confidence > intent2.confidence ? intent1 : intent2;
            }
        };
    }
    
    // Validação rigorosa antes de classificar intenção
    validateIntent(intent, text, context) {
        const rules = this.contextRules[intent];
        if (!rules) return { valid: true, confidence: 1.0 };
        
        let validationScore = 0;
        let maxScore = 0;
        
        // Verificar elementos obrigatórios
        for (let required of rules.required) {
            maxScore += 1;
            if (this.hasElement(text, required)) {
                validationScore += 1;
            }
        }
        
        // Verificar elementos proibidos (penalização)
        for (let forbidden of rules.forbidden) {
            if (this.hasElement(text, forbidden)) {
                validationScore -= 0.5; // Penalização
            }
        }
        
        // Verificar padrões específicos
        for (let pattern of rules.patterns) {
            if (pattern.test(text)) {
                validationScore += 0.5; // Bonus por padrão específico
            }
        }
        
        const confidence = Math.max(0, Math.min(1, validationScore / maxScore));
        
        return {
            valid: confidence > 0.5,
            confidence: confidence,
            score: validationScore,
            maxScore: maxScore
        };
    }
    
    // Detectar elementos no texto - SISTEMA ULTRA-INTELIGENTE
    hasElement(text, element) {
        const textLower = text.toLowerCase();
        
        switch (element) {
            case 'valor_monetario':
                return /\d+\s*(?:real|reais?|contos?|pila|grana|trocado|trocados)/i.test(text) || 
                       /R?\$?\s*\d+/i.test(text);
            
            case 'conta_fixa_especifica':
                const fixedBillKeywords = [
                    'aluguel', 'energia', 'luz', 'água', 'agua', 'internet', 'telefone',
                    'gás', 'gas', 'condomínio', 'condominio', 'seguro', 'escola',
                    'cartão', 'cartao', 'streaming', 'academia', 'plano', 'mensalidade',
                    'netflix', 'spotify', 'youtube', 'prime', 'disney', 'hbo', 'hbo max',
                    'energia elétrica', 'energia eletrica', 'conta de luz', 'conta de agua',
                    'conta de água', 'conta de gas', 'conta de gás', 'conta de telefone',
                    'conta de internet', 'conta de streaming', 'conta de academia'
                ];
                return fixedBillKeywords.some(keyword => textLower.includes(keyword));
            
            case 'transferencia_para_pessoa':
                return /transferi\s+[\d,]+\s+(?:reais?|contos?|pila|grana|trocado|trocados)\s+(?:para|pro)\s+(?:o|a|para)\s+[a-záàâãéèêíìîóòôõúùûç]+/i.test(text);
            
            case 'conta_origem':
                return /(?:de|do|da)\s+(.+?)\s+(?:para|pro)/i.test(text);
            
            case 'conta_destino':
                return /(?:para|pro)\s+(.+?)(?:\s|$)/i.test(text);
            
            case 'valor_monetario_especifico':
                return /\bR?\$?\s*[\d,]+\s*(?:reais?|contos?|pila|grana|trocado|trocados)\b/i.test(text);
            
            case 'tempo_temporal':
                const timeKeywords = [
                    'hoje', 'ontem', 'anteontem', 'semana passada', 'semana passada',
                    'mês passado', 'mes passado', 'ano passado', 'na segunda', 'terça-feira',
                    'terca-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado',
                    'sabado', 'domingo', 'manhã', 'manha', 'tarde', 'noite', 'madrugada'
                ];
                return timeKeywords.some(keyword => textLower.includes(keyword));
            
            case 'expressao_coloquial':
                const colloquialKeywords = [
                    'pila', 'pila', 'contos', 'contos', 'grana', 'um trocado', 'uns trocados',
                    'isso aí', 'isso ai', 'beleza', 'tá certo', 'ta certo', 'perfeito', 'show',
                    'valeu', 'obrigado', 'obrigada', 'tranquilo', 'suave', 'de boa', 'de boa'
                ];
                return colloquialKeywords.some(keyword => textLower.includes(keyword));
            
            default:
                return false;
        }
    }
    
    // Resolver conflitos entre intenções
    resolveConflict(intent1, intent2, text, context) {
        const validation1 = this.validateIntent(intent1, text, context);
        const validation2 = this.validateIntent(intent2, text, context);
        
        // Se uma intenção é claramente inválida, escolher a outra
        if (!validation1.valid && validation2.valid) {
            return { intent: intent2, confidence: validation2.confidence };
        }
        if (validation1.valid && !validation2.valid) {
            return { intent: intent1, confidence: validation1.confidence };
        }
        
        // Se ambas são válidas, usar estratégia de resolução
        const resolution = this.conflictResolution.contextual(intent1, intent2, context);
        
        return {
            intent: resolution,
            confidence: Math.max(validation1.confidence, validation2.confidence),
            resolutionStrategy: 'contextual'
        };
    }
    
    // Calcular score de contexto
    calculateContextScore(intent, context) {
        let score = 0;
        
        // Boost por histórico recente
        if (context.conversationHistory) {
            const recentIntents = context.conversationHistory
                .slice(-3)
                .map(entry => entry.intent);
            
            if (recentIntents.includes(intent)) {
                score += 0.3;
            }
        }
        
        // Boost por padrões do usuário
        if (context.userPatterns && context.userPatterns[intent]) {
            score += context.userPatterns[intent] * 0.2;
        }
        
        return score;
    }
    
    // Obter prioridade da intenção
    getIntentPriority(intent) {
        const priorities = {
            'GREETING': 10, // PRIORIDADE MÁXIMA para evitar conflitos
            'PAY_FIXED_BILL': 5,
            'ADD_EXPENSE': 4,
            'ADD_INCOME': 4,
            'PERFORM_TRANSFER': 3,
            'QUERY_BALANCE': 2,
            'QUERY_EXPENSES': 2,
            'QUERY_INCOME': 2,
            'QUERY_TRANSACTIONS': 2,
            'ADD_FIXED_BILL': 1,
            'QUERY_FIXED_BILLS': 1,
            'ADD_DEBT': 1,
            'QUERY_DEBTS': 1,
            'REFUND_TRANSACTION': 1,
            'UNKNOWN': -1
        };
        
        return priorities[intent] || 0;
    }
}

// ========================================
// SISTEMA DE CONTEXTO INTELIGENTE
// ========================================

class AdvancedContextManager {
    constructor() {
        this.conversationHistory = [];
        this.pendingQuestions = [];
        this.contextData = {};
        this.userPreferences = {};
        this.sessionData = {
            lastIntent: null,
            confidence: 0,
            conversationFlow: [],
            userMood: 'neutral',
            lastAction: null,
            errorCount: 0,
            successCount: 0
        };
        this.abortCommands = [
            'esquece', 'deixa', 'cancelar', 'abortar', 'stop',
            'volta', 'voltar', 'anterior', 'antes', 'outra coisa', 'mudar assunto'
        ];
        this.confirmationCommands = [
            'sim', 'correto', 'certo', 'exato', 'perfeito', 'ok', 'okay', 'confirmo',
            'confirma', 'confirmar', 'prossegue', 'continua', 'vai'
        ];
        this.maxHistorySize = 50;
        this.contextTimeout = 300000; // 5 minutos
    }

    // Gerenciamento de contexto avançado
    addToHistory(message, intent, confidence, response) {
        const entry = {
            timestamp: new Date(),
            message: message.toLowerCase(),
            intent: intent,
            confidence: confidence,
            response: response,
            contextData: { ...this.contextData }
        };
        
        this.conversationHistory.push(entry);
        
        // Manter histórico limitado
        if (this.conversationHistory.length > this.maxHistorySize) {
            this.conversationHistory.shift();
        }
        
        // Atualizar estatísticas
        if (confidence > 0.7) {
            this.sessionData.successCount++;
        } else {
            this.sessionData.errorCount++;
        }
    }

    // Análise de contexto inteligente
    analyzeContext(text) {
        const textLower = text.toLowerCase();
        
        // Detectar humor do usuário
        const positiveWords = ['obrigado', 'valeu', 'legal', 'ótimo', 'excelente', 'perfeito'];
        const negativeWords = ['erro', 'problema', 'não funciona', 'bug', 'ruim', 'péssimo'];
        
        if (positiveWords.some(word => textLower.includes(word))) {
            this.sessionData.userMood = 'positive';
        } else if (negativeWords.some(word => textLower.includes(word))) {
            this.sessionData.userMood = 'negative';
        }

        // Detectar padrões de conversa
        const patterns = {
            isQuestion: /\?$|^(quem|o que|quando|onde|como|por que|qual|quais)/i,
            isCommand: /^(faça|faz|execute|mostre|mostra|diga|diz|calcule|calcular)/i,
            isStatement: /^(eu|meu|minha|tenho|gastei|recebi|paguei|transferi)/i
        };

        return {
            isQuestion: patterns.isQuestion.test(text),
            isCommand: patterns.isCommand.test(text),
            isStatement: patterns.isStatement.test(text),
            userMood: this.sessionData.userMood
        };
    }

    // Gerenciamento de perguntas pendentes
    addPendingQuestion(type, data, priority = 1) {
        this.pendingQuestions.push({
            type,
            data,
            priority,
            timestamp: new Date(),
            attempts: 0
        });
        
        // Ordenar por prioridade
        this.pendingQuestions.sort((a, b) => b.priority - a.priority);
    }

    getNextPendingQuestion() {
        if (this.pendingQuestions.length === 0) return null;
        
        const question = this.pendingQuestions[0];
        
        // Verificar timeout
        if (new Date() - question.timestamp > this.contextTimeout) {
            this.pendingQuestions.shift();
            return this.getNextPendingQuestion();
        }
        
        return question;
    }

    resolvePendingQuestion() {
        this.pendingQuestions.shift();
    }

    // Comandos de controle
    isAbortCommand(text) {
        const textLower = text.toLowerCase();
        return this.abortCommands.some(cmd => textLower.includes(cmd));
    }

    isConfirmationCommand(text) {
        const textLower = text.toLowerCase();
        return this.confirmationCommands.some(cmd => textLower.includes(cmd));
    }

    // Limpeza de contexto
    clear() {
        this.pendingQuestions = [];
        this.contextData = {};
        this.sessionData.lastIntent = null;
        this.sessionData.confidence = 0;
    }

    // Análise de sentimento
    analyzeSentiment(text) {
        const textLower = text.toLowerCase();
        
        const positiveWords = [
            'obrigado', 'valeu', 'legal', 'ótimo', 'excelente', 'perfeito', 'bom', 'boa',
            'funciona', 'certo', 'correto', 'exato', 'preciso', 'útil', 'ajuda'
        ];
        
        const negativeWords = [
            'erro', 'problema', 'bug', 'ruim', 'péssimo', 'não funciona', 'falha',
            'difícil', 'complicado', 'confuso', 'não entendo', 'errado'
        ];

        const positiveCount = positiveWords.filter(word => textLower.includes(word)).length;
        const negativeCount = negativeWords.filter(word => textLower.includes(word)).length;

        if (positiveCount > negativeCount) return 'positive';
        if (negativeCount > positiveCount) return 'negative';
        return 'neutral';
    }

    // Sugestões inteligentes baseadas no histórico
    getSuggestions() {
        const recentIntents = this.conversationHistory
            .slice(-5)
            .map(entry => entry.intent)
            .filter(Boolean);

        const suggestions = [];
        
        if (recentIntents.includes('ADD_EXPENSE')) {
            suggestions.push('Quer ver um resumo dos seus gastos?');
        }
        
        if (recentIntents.includes('QUERY_BALANCE')) {
            suggestions.push('Posso ajudar a registrar uma transação');
        }
        
        if (recentIntents.includes('PERFORM_TRANSFER')) {
            suggestions.push('Quer ver o histórico de transferências?');
        }

        return suggestions;
    }
}

// ========================================
// EXTRATOR DE ENTIDADES AVANÇADO
// ========================================

class AdvancedEntityExtractor {
    constructor() {
        this.numberWords = {
            'zero': 0, 'um': 1, 'uma': 1, 'dois': 2, 'duas': 2, 'três': 3, 'quatro': 4, 'cinco': 5,
            'seis': 6, 'sete': 7, 'oito': 8, 'nove': 9, 'dez': 10,
            'onze': 11, 'doze': 12, 'treze': 13, 'quatorze': 14, 'quinze': 15,
            'dezesseis': 16, 'dezessete': 17, 'dezoito': 18, 'dezenove': 19, 'vinte': 20,
            'trinta': 30, 'quarenta': 40, 'cinquenta': 50, 'sessenta': 60,
            'setenta': 70, 'oitenta': 80, 'noventa': 90, 'cem': 100,
            'mil': 1000, 'milhão': 1000000, 'milhões': 1000000
        };

        this.bankAliases = {
            'nubank': ['roxinho', 'roxo', 'nubank', 'nu', 'roxo', 'cartão roxo', 'cartao roxo', 'roxinho do nu'],
            'itau': ['itau', 'itaú', 'itau unibanco', 'itaú unibanco', 'laranja itau', 'laranja itaú'],
            'bradesco': ['bradesco', 'laranja', 'laranjinha', 'bradesco banco', 'banco bradesco'],
            'santander': ['santander', 'vermelho', 'santander banco', 'banco santander', 'santander brasil'],
            'caixa': ['caixa', 'caixa economica', 'caixa econômica', 'cef', 'caixa federal', 'banco caixa'],
            'banco do brasil': ['bb', 'banco do brasil', 'banco brasil', 'brasil banco', 'amarelinho'],
            'inter': ['inter', 'banco inter', 'laranja inter', 'inter banco'],
            'c6': ['c6', 'c6 bank', 'c6 banco', 'banco c6', 'c6bank'],
            'picpay': ['picpay', 'pic pay', 'verde picpay', 'cartão picpay', 'cartao picpay'],
            'mercado pago': ['mercado pago', 'mercadopago', 'mp', 'azul mercado pago'],
            'next': ['next', 'banco next', 'next bradesco', 'roxo next'],
            'original': ['original', 'banco original', 'original banco'],
            'banco pan': ['pan', 'banco pan', 'panamericano'],
            'neon': ['neon', 'banco neon', 'neon banco', 'azul neon'],
            'will bank': ['will', 'will bank', 'will banco'],
            'stone': ['stone', 'stone banco', 'banco stone'],
            'bs2': ['bs2', 'banco bs2', 'bs2 banco'],
            'modal': ['modal', 'banco modal', 'modal banco'],
            'bmg': ['bmg', 'banco bmg', 'bmg banco'],
            'sofisa': ['sofisa', 'banco sofisa', 'sofisa banco']
        };

        this.categoryAliases = {
            'alimentacao': ['comida', 'mercado', 'restaurante', 'lanche', 'café', 'cafe', 'almoço', 'almoco', 'jantar', 'café da manhã', 'cafe da manha', 'ifood', 'delivery', 'padaria', 'açougue', 'açaiteria', 'hamburgueria', 'pizza', 'pizzaria', 'supermercado', 'quitanda', 'feira'],
            'transporte': ['uber', '99', 'taxi', 'táxi', 'onibus', 'ônibus', 'metro', 'metrô', 'combustivel', 'gasolina', 'alcool', 'álcool', 'etanol', 'diesel', 'posto', 'posto de gasolina', 'cabify', 'blablacar', 'estacionamento', 'valet'],
            'moradia': ['aluguel', 'rent', 'apartamento', 'casa', 'moradia', 'condominio', 'condomínio'],
            'energia': ['energia', 'luz', 'eletricidade', 'light', 'enel', 'eletropaulo'],
            'agua': ['agua', 'água', 'water', 'sabesp'],
            'internet': ['internet', 'net', 'wi-fi', 'wifi', 'banda larga', 'provedor'],
            'telefone': ['telefone', 'celular', 'phone', 'mobile', 'vivo', 'claro', 'oi', 'tim'],
            'gas': ['gas', 'gás', 'gas natural', 'comgas'],
            'seguro': ['seguro', 'insurance', 'porto seguro', 'bradesco seguro'],
            'escola': ['escola', 'faculdade', 'universidade', 'college', 'school', 'mensalidade'],
            'cartao': ['cartao', 'cartão', 'fatura', 'credito', 'crédito'],
            'streaming': ['netflix', 'spotify', 'disney', 'hbo', 'amazon', 'streaming'],
            'academia': ['academia', 'gym', 'fitness', 'personal', 'treino'],
            'saude': ['medico', 'médico', 'farmacia', 'farmácia', 'remedio', 'remédio', 'consulta', 'dentista', 'psicólogo', 'psicologo', 'exame', 'laboratório', 'laboratorio', 'hospital', 'clinica', 'clínica', 'drogaria', 'pague menos', 'droga raia', 'ultra popular'],
            'lazer': ['cinema', 'teatro', 'show', 'concerto', 'bar', 'balada', 'festa', 'choperia', 'chopperia', 'pub', 'boate', 'clube', 'parque', 'shopping', 'viagem', 'hotel', 'pousada', 'praia', 'cinema cine', 'pipoca', 'ingresso', 'evento', 'festa junina', 'carnaval', 'aniversário', 'aniversario'],
            'vestuario': ['roupa', 'sapato', 'tenis', 'tênis', 'acessorio', 'acessório', 'camisa', 'camiseta', 'calça', 'calca', 'short', 'vestido', 'saia', 'blusa', 'jaqueta', 'casaco', 'moletom', 'chinelo', 'sandália', 'sandalia', 'bota', 'meia', 'cueca', 'calcinha', 'sutiã', 'sutia']
        };
    }

    // Extração de valores monetários avançada
    extractMoney(text) {
        const textLower = text.toLowerCase();
        
        
        // Padrões monetários
        const moneyPatterns = [
            /R\$\s*(\d+[.,]\d+|\d+)/gi,
            /(\d+[.,]\d+|\d+)\s*reais?/gi,
            /(\d+[.,]\d+|\d+)\s*contos?/gi,
            /(\d+[.,]\d+|\d+)\s*pila/gi,
            /(\d+[.,]\d+|\d+)\s*real/gi,
            /(\d+[.,]\d+|\d+)\s*centavos?/gi,
            /(\d+[.,]\d+|\d+)\s*real/gi,
            /(\d+[.,]\d+)/g, // NOVO: Valores decimais simples (1,50, 1.50)
            /^(\d+[.,]?\d*)$/i  // Números simples como "10" ou "10.50"
        ];

        // Tentar padrões primeiro
        for (let i = 0; i < moneyPatterns.length; i++) {
            const pattern = moneyPatterns[i];
            const match = text.match(pattern);
            if (match) {
                let value;
                if (i === 7) { // Padrão específico para valores decimais
                    value = match[0].replace(',', '.');
                } else {
                    value = match[1] || match[0].replace(/[^\d,.]/g, '');
                    value = value.replace(',', '.');
                }
                const parsed = parseFloat(value);
                if (!isNaN(parsed) && parsed > 0) {
                    return parsed;
                }
            }
        }

        // Extrair números por extenso
        const result = this.extractNumberWords(textLower);
        if (result > 0) {
            return result;
        }
        
        return null;
    }

    // Extração de datas avançada
    extractDate(text) {
        const textLower = text.toLowerCase();
        
        
        // Padrões de data
        const datePatterns = [
            // Formato DD/MM/YYYY ou DD/MM/YY
            /(\d{1,2})\/(\d{1,2})\/(\d{2,4})/g,
            // Formato DD-MM-YYYY ou DD-MM-YY
            /(\d{1,2})-(\d{1,2})-(\d{2,4})/g,
            // Formato DD.MM.YYYY ou DD.MM.YY
            /(\d{1,2})\.(\d{1,2})\.(\d{2,4})/g,
            // Formato DD de Mês de YYYY
            /(\d{1,2})\s+de\s+(janeiro|fevereiro|março|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)\s+de\s+(\d{4})/g,
            // Formato DD de Mês
            /(\d{1,2})\s+de\s+(janeiro|fevereiro|março|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)/g,
            // Palavras-chave de data
            /(hoje|ontem|anteontem|amanhã|amanha)/g,
            // Dias da semana
            /(segunda|terça|quarta|quinta|sexta|sábado|domingo)(-feira)?/g
        ];

        // Mapeamento de meses
        const monthMap = {
            'janeiro': 1, 'fevereiro': 2, 'março': 3, 'abril': 4,
            'maio': 5, 'junho': 6, 'julho': 7, 'agosto': 8,
            'setembro': 9, 'outubro': 10, 'novembro': 11, 'dezembro': 12
        };

        // Tentar padrões primeiro
        for (let i = 0; i < datePatterns.length; i++) {
            const pattern = datePatterns[i];
            const match = text.match(pattern);
            if (match) {
                let date;
                
                if (i === 0) { // Formato DD/MM/YYYY
                    const parts = match[0].split('/');
                    const day = parseInt(parts[0]);
                    const month = parseInt(parts[1]);
                    let year = parseInt(parts[2]);
                    if (year < 100) year += 2000; // Converter YY para YYYY
                    date = new Date(year, month - 1, day);
                } else if (i === 1) { // Formato DD-MM-YYYY
                    const parts = match[0].split('-');
                    const day = parseInt(parts[0]);
                    const month = parseInt(parts[1]);
                    let year = parseInt(parts[2]);
                    if (year < 100) year += 2000;
                    date = new Date(year, month - 1, day);
                } else if (i === 2) { // Formato DD.MM.YYYY
                    const parts = match[0].split('.');
                    const day = parseInt(parts[0]);
                    const month = parseInt(parts[1]);
                    let year = parseInt(parts[2]);
                    if (year < 100) year += 2000;
                    date = new Date(year, month - 1, day);
                } else if (i === 3) { // Formato DD de Mês de YYYY
                    const day = parseInt(match[1]);
                    const month = monthMap[match[2]];
                    const year = parseInt(match[3]);
                    date = new Date(year, month - 1, day);
                } else if (i === 4) { // Formato DD de Mês (ano atual)
                    const day = parseInt(match[1]);
                    const month = monthMap[match[2]];
                    const year = new Date().getFullYear();
                    date = new Date(year, month - 1, day);
                } else if (i === 5) { // Palavras-chave de data
                    const today = new Date();
                    switch (match[1]) {
                        case 'hoje':
                            date = new Date(today);
                            break;
                        case 'ontem':
                            date = new Date(today);
                            date.setDate(date.getDate() - 1);
                            break;
                        case 'anteontem':
                            date = new Date(today);
                            date.setDate(date.getDate() - 2);
                            break;
                        case 'amanhã':
                        case 'amanha':
                            date = new Date(today);
                            date.setDate(date.getDate() + 1);
                            break;
                    }
                }
                
                if (date && !isNaN(date.getTime())) {
                    return date;
                }
            }
        }
        
        return null;
    }

    // Extração de números por extenso
    extractNumberWords(text) {
        const words = text.split(' ');
        let totalValue = 0;
        let currentValue = 0;
        let multiplier = 1;

        for (let i = 0; i < words.length; i++) {
            const word = words[i];
            
            if (this.numberWords[word] !== undefined) {
                const num = this.numberWords[word];
                
                if (num >= 1000) {
                    if (currentValue > 0) {
                        totalValue += currentValue * num;
                        currentValue = 0;
                    } else {
                        totalValue += num;
                    }
                } else if (num >= 100) {
                    if (currentValue > 0) {
                        totalValue += currentValue * num;
                        currentValue = 0;
                    } else {
                        totalValue += num;
                    }
                } else {
                    currentValue = currentValue * 10 + num;
                }
            } else if (word === 'e' && i > 0 && i < words.length - 1) {
                continue;
            } else if (word === 'reais' || word === 'real' || word === 'contos' || word === 'conto') {
                if (currentValue > 0) {
                    totalValue += currentValue;
                    currentValue = 0;
                }
                break;
            }
        }

        if (currentValue > 0) {
            totalValue += currentValue;
        }

        return totalValue > 0 ? totalValue : null;
    }

    // Extração de datas avançada

    // Extração de conta bancária inteligente
    extractAccount(text, userAccounts) {
        if (!userAccounts || userAccounts.length === 0) return null;

        const textLower = text.toLowerCase();
        
        // Match exato primeiro
        for (let account of userAccounts) {
            if (textLower.includes(account.name.toLowerCase())) {
                return account;
            }
        }

        // Match parcial
        for (let account of userAccounts) {
            const accountWords = account.name.toLowerCase().split(' ');
            for (let word of accountWords) {
                if (word.length > 2 && textLower.includes(word)) {
                    return account;
                }
            }
        }

        // Apelidos bancários
        for (let [bankName, aliasList] of Object.entries(this.bankAliases)) {
            for (let alias of aliasList) {
                if (textLower.includes(alias)) {
                    for (let account of userAccounts) {
                        if (account.name.toLowerCase().includes(bankName)) {
                            return account;
                        }
                    }
                }
            }
        }

        return null;
    }

    // Detecção inteligente de pagamento restante
    detectRemainingPayment(text) {
        const textLower = text.toLowerCase();
        
        // Padrões para pagamento restante/completo
        const remainingPatterns = [
            /pagar\s+(?:o\s+)?restante\s+(?:do|da)\s+(.+)/i,
            /pagar\s+(?:o\s+)?que\s+falta\s+(?:do|da)\s+(.+)/i,
            /pagar\s+(?:o\s+)?que\s+resta\s+(?:do|da)\s+(.+)/i,
            /pagar\s+(?:o\s+)?saldo\s+(?:do|da)\s+(.+)/i,
            /pagar\s+(?:o\s+)?completo\s+(?:do|da)\s+(.+)/i,
            /pagar\s+(?:o\s+)?total\s+(?:do|da)\s+(.+)/i,
            /quitei\s+(?:o\s+)?restante\s+(?:do|da)\s+(.+)/i,
            /quitei\s+(?:o\s+)?que\s+falta\s+(?:do|da)\s+(.+)/i,
            /quitei\s+(?:o\s+)?completo\s+(?:do|da)\s+(.+)/i,
            /finalizar\s+(?:o\s+)?pagamento\s+(?:do|da)\s+(.+)/i,
            /completar\s+(?:o\s+)?pagamento\s+(?:do|da)\s+(.+)/i
        ];
        
        for (const pattern of remainingPatterns) {
            const match = textLower.match(pattern);
            if (match) {
                return {
                    isRemainingPayment: true,
                    billName: match[1].trim()
                };
            }
        }
        
        return { isRemainingPayment: false };
    }

    // Extração de conta fixa inteligente
    extractFixedBill(text, fixedBills) {
        // Validação robusta de entrada
        if (!text || typeof text !== 'string') {
            console.warn('extractFixedBill: text inválido:', text);
            return null;
        }
        
        if (!fixedBills || !Array.isArray(fixedBills) || fixedBills.length === 0) {
            console.warn('extractFixedBill: fixedBills inválido ou vazio:', fixedBills);
            return null;
        }

        const textLower = text.toLowerCase();
        
        // Debug: mostrar busca de conta fixa
        
        // Padrões para pagamento de contas fixas
        const billPatterns = [
            /paguei\s+(?:o|a)\s+(.+)/i,
            /paguei\s+(.+)/i,
            /paguei\s+(?:a|o)\s+(.+?)\s+(?:com|no|na|usando)\s+(.+)/i,
            /quitei\s+(?:o|a)\s+(.+)/i,
            /quitei\s+(.+)/i,
            /paguei\s+(?:a|o)\s+(.+?)\s+(?:com|no|na|usando)\s+(.+)/i
        ];

        // Tentar extrair nome da conta fixa dos padrões
        for (let pattern of billPatterns) {
            const match = text.match(pattern);
            if (match) {
                const billName = match[1].trim().toLowerCase();
                
                // Match exato primeiro
                for (let bill of fixedBills) {
                    // Validação robusta do objeto bill
                    if (!bill || (!bill.name && !bill.description) || typeof (bill.name || bill.description) !== 'string') {
                        console.warn('extractFixedBill: bill inválido:', bill);
                        continue;
                    }
                    
                    const billNameLower = (bill.name || bill.description).toLowerCase();
                    if (billName.includes(billNameLower) || billNameLower.includes(billName)) {
                        return bill;
                    }
                }

                // Match parcial
                for (let bill of fixedBills) {
                    // Validação robusta do objeto bill
                    if (!bill || (!bill.name && !bill.description) || typeof (bill.name || bill.description) !== 'string') {
                        continue;
                    }
                    
                    const billWords = (bill.name || bill.description).toLowerCase().split(' ');
                    for (let word of billWords) {
                        if (word.length > 2 && billName.includes(word)) {
                            return bill;
                        }
                    }
                }
            }
        }

        // Busca direta por nome da conta fixa
        for (let bill of fixedBills) {
            // Validação robusta do objeto bill
            if (!bill || (!bill.name && !bill.description) || typeof (bill.name || bill.description) !== 'string') {
                continue;
            }
            
            const billNameLower = (bill.name || bill.description).toLowerCase();
            
            // Verificar se o texto contém o nome da conta fixa diretamente
            if (textLower.includes(billNameLower)) {
                return bill;
            }
            
            // Verificar palavras individuais da conta fixa (para nomes como "gg")
            const billWords = billNameLower.split(' ');
            for (let word of billWords) {
                if (word.length > 1 && textLower.includes(word)) {
                    return bill;
                }
            }
        }

        return null;
    }

    // Extração de categoria inteligente
    extractCategory(text) {
        const textLower = text.toLowerCase();
        
        for (let [category, aliasList] of Object.entries(this.categoryAliases)) {
            for (let alias of aliasList) {
                if (textLower.includes(alias)) {
                    return category;
                }
            }
        }

        return 'outros';
    }

    // Função para escapar caracteres especiais de regex
    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // Extração de descrição ULTRA-INTELIGENTE
    extractDescription(text, excludeWords = []) {
        let description = text.toLowerCase();
        
        // SISTEMA DE DETECÇÃO DE CONTEXTO INTELIGENTE
        const contextPatterns = [
            // Padrões com preposições (mais específicos)
            { pattern: /(?:gastei|paguei|comprei|saquei|retirei)\s+[\d,]+\s*(?:reais?|contos?|pila|grana|r\$)\s+(?:com|no|na|em|de|para|por)\s+(.+)/i, group: 1 },
            { pattern: /(?:foi|debitou)\s+[\d,]+\s*(?:reais?|contos?|pila|grana|r\$)\s+(?:com|no|na|em|de|para|por)\s+(.+)/i, group: 1 },
            { pattern: /(?:comprei|paguei)\s+(.+?)\s+(?:por|a)\s+[\d,]+\s*(?:reais?|contos?|pila|grana|r\$)/i, group: 1 },
            
            // Padrões diretos (mais específicos)
            { pattern: /(?:gastei|paguei|comprei|saquei|retirei)\s+[\d,]+\s*(?:reais?|contos?|pila|grana|r\$)\s+(.+)/i, group: 1 },
            { pattern: /(?:foi|debitou)\s+[\d,]+\s*(?:reais?|contos?|pila|grana|r\$)\s+(.+)/i, group: 1 },
            
            // Padrões com valores no final (mais específicos)
            { pattern: /(?:comprei|paguei)\s+(.+?)\s+[\d,]+\s*(?:reais?|contos?|pila|grana|r\$)/i, group: 1 },
            
            // Padrões específicos para transferências
            { pattern: /(?:transferi|movi|mandei|enviei)\s+[\d,]+\s*(?:reais?|contos?|pila|grana|r\$)\s+(?:de|do|da)\s+(.+?)\s+(?:para|pro)/i, group: 1 },
            { pattern: /(?:transferi|movi|mandei|enviei)\s+[\d,]+\s*(?:reais?|contos?|pila|grana|r\$)\s+(?:para|pro)\s+(.+)/i, group: 1 },
            
            // Padrões específicos para casos como "comprei 1 real de copo"
            { pattern: /(?:comprei|paguei)\s+[\d,]+\s*(?:real|reais?)\s+(?:de|do|da)\s+(.+)/i, group: 1 }
        ];
        
        // Tentar extrair usando padrões de contexto
        for (let contextPattern of contextPatterns) {
            const match = description.match(contextPattern.pattern);
            if (match && match[contextPattern.group]) {
                description = match[contextPattern.group].trim();
                break;
            }
        }
        
        // SISTEMA DE LIMPEZA INTELIGENTE
        const cleaningRules = [
            // Remover palavras relacionadas a dinheiro (mais específicas)
            { pattern: /\b(?:reais?|contos?|conto|r\$|pila|grana|dinheiro|valor|valor de|trocado|trocados)\b/gi, replacement: '' },
            
            // Remover palavras de ação (mais específicas)
            { pattern: /\b(?:gastei|paguei|foi|debitou|comprei|saquei|retirei|recebi|ganhei|caiu|entrou|pingou|depositei|transferi|movi|mandei|enviei)\b/gi, replacement: '' },
            
            // Remover preposições desnecessárias
            { pattern: /\b(?:com|no|na|em|de|para|por|do|da|dos|das|pelo|pela|pelos|pelas)\b/gi, replacement: '' },
            
            // Remover artigos
            { pattern: /\b(?:o|a|os|as|um|uma|uns|umas)\b/gi, replacement: '' },
            
            // Remover palavras específicas do contexto
            { pattern: /\b(?:nubank|itau|bradesco|caixa|santander|banco|conta|cartao|cartão|pix|ted|doc)\b/gi, replacement: '' },
            
            // Remover números isolados
            { pattern: /\b\d+\b/g, replacement: '' },
            
            // Remover símbolos monetários
            { pattern: /[R\$]/g, replacement: '' }
        ];
        
        // Aplicar regras de limpeza
        cleaningRules.forEach(rule => {
            description = description.replace(rule.pattern, rule.replacement);
        });
        
        // Remover palavras específicas do contexto
        excludeWords.forEach(word => {
            description = description.replace(new RegExp(this.escapeRegex(word), 'gi'), '');
        });
        
        // SISTEMA DE NORMALIZAÇÃO INTELIGENTE
        description = description
            .trim()                           // Remover espaços extras
            .replace(/\s+/g, ' ')            // Normalizar espaços
            .trim();                         // Limpar novamente
        
        // VALIDAÇÃO INTELIGENTE
        if (description.length < 2) {
            return null;
        }
        
        // Filtrar descrições muito genéricas
        const genericWords = ['coisa', 'item', 'produto', 'servico', 'serviço', 'compra', 'gasto', 'despesa'];
        if (genericWords.some(word => description.includes(word))) {
            return null;
        }
        
        // Capitalizar primeira letra
        description = description.charAt(0).toUpperCase() + description.slice(1);
        
        return description;
    }
}

// ========================================
// CLASSIFICADOR DE INTENÇÕES AVANÇADO
// ========================================

class AdvancedIntentClassifier {
    constructor() {
        this.intentions = this.initializeIntentions();
        this.confidenceThreshold = 0.2;
        this.fallbackIntent = 'UNKNOWN';
    }

    initializeIntentions() {
        return [
            // INTENÇÕES DE SAUDAÇÃO E AJUDA
            {
                name: 'GREETING',
                keywords: [
                    { word: 'oi', weight: 0.9 },
                    { word: 'olá', weight: 0.9 },
                    { word: 'ola', weight: 0.9 },
                    { word: 'e aí', weight: 0.8 },
                    { word: 'eai', weight: 0.8 },
                    { word: 'eae', weight: 0.8 },
                    { word: 'salve', weight: 0.8 },
                    { word: 'salvee', weight: 0.8 },
                    { word: 'fala', weight: 0.7 },
                    { word: 'fala aí', weight: 0.8 },
                    { word: 'fala ai', weight: 0.8 },
                    { word: 'bom dia', weight: 0.8 },
                    { word: 'boa tarde', weight: 0.8 },
                    { word: 'boa noite', weight: 0.8 },
                    { word: 'oi dinah', weight: 1.0 },
                    { word: 'olá dinah', weight: 1.0 },
                    { word: 'ola dinah', weight: 1.0 },
                    { word: 'e aí dinah', weight: 1.0 },
                    { word: 'eai dinah', weight: 1.0 },
                    { word: 'salve dinah', weight: 1.0 },
                    { word: 'fala dinah', weight: 1.0 },
                    { word: 'ajuda', weight: 0.7 },
                    { word: 'duvida', weight: 0.6 },
                    { word: 'dúvida', weight: 0.6 },
                    { word: 'como funciona', weight: 0.8 },
                    { word: 'como funciona isso', weight: 0.8 },
                    { word: 'o que você faz', weight: 0.8 },
                    { word: 'o que voce faz', weight: 0.8 },
                    { word: 'quais são suas funções', weight: 0.8 },
                    { word: 'quais sao suas funcoes', weight: 0.8 },
                    { word: 'quais são suas funcoes', weight: 0.8 },
                    { word: 'quais sao suas funções', weight: 0.8 },
                    { word: 'quais são sua funções', weight: 0.8 },
                    { word: 'quais sao sua funcoes', weight: 0.8 },
                    { word: 'quais são sua funcoes', weight: 0.8 },
                    { word: 'quais sao sua funções', weight: 0.8 },
                    { word: 'quais sao suas funcoes', weight: 0.8 },
                    { word: 'quais são suas funcoes', weight: 0.8 },
                    { word: 'quais sao suas funções', weight: 0.8 },
                    { word: 'quais são suas funcoes', weight: 0.8 },
                    { word: 'me ajuda', weight: 0.7 },
                    { word: 'me ajuda aí', weight: 0.8 },
                    { word: 'me ajuda ai', weight: 0.8 },
                    { word: 'pode me ajudar', weight: 0.7 },
                    { word: 'posso te perguntar', weight: 0.6 },
                    { word: 'tenho uma dúvida', weight: 0.6 },
                    { word: 'tenho uma duvida', weight: 0.6 },
                    { word: 'como usar', weight: 0.7 },
                    { word: 'como usar isso', weight: 0.7 },
                    { word: 'não sei como usar', weight: 0.7 },
                    { word: 'nao sei como usar', weight: 0.7 },
                    { word: 'primeira vez', weight: 0.6 },
                    { word: 'começar', weight: 0.6 },
                    { word: 'comecar', weight: 0.6 },
                    { word: 'iniciar', weight: 0.6 },
                    { word: 'start', weight: 0.5 },
                    { word: 'hello', weight: 0.5 },
                    { word: 'hi', weight: 0.5 },
                    { word: 'funcionalidades', weight: 0.7 },
                    { word: 'recursos', weight: 0.6 },
                    { word: 'capacidades', weight: 0.6 },
                    { word: 'o que você pode fazer', weight: 0.8 },
                    { word: 'o que voce pode fazer', weight: 0.8 },
                    { word: 'o que você consegue fazer', weight: 0.8 },
                    { word: 'o que voce consegue fazer', weight: 0.8 },
                    { word: 'quantos anos', weight: 0.7 },
                    { word: 'quantos', weight: 0.5 },
                    { word: 'quanto', weight: 0.4 },
                    { word: 'pergunta', weight: 0.6 },
                    { word: 'dúvida', weight: 0.6 },
                    { word: 'duvida', weight: 0.6 },
                    { word: 'curiosidade', weight: 0.5 },
                    { word: 'saber', weight: 0.4 },
                    { word: 'conhecer', weight: 0.4 }
                ],
                patterns: [
                    /^(oi|olá|ola|e aí|eai|eae|salve|fala|bom dia|boa tarde|boa noite)/i,
                    /(oi|olá|ola|e aí|eai|eae|salve|fala)\s+dinah/i,
                    /como\s+(você\s+)?funciona/i,
                    /como\s+(você\s+)?funciona\s+isso/i,
                    /o\s+que\s+(você\s+)?faz/i,
                    /quais\s+s[ãa]o\s+suas?\s+fun[çc][õo]es/i,
                    /quais\s+s[ãa]o\s+suas?\s+fun[çc][õo]es\?/i,
                    /quais\s+s[ãa]o\s+suas?\s+fun[çc][õo]es\s*\?/i,
                    /o\s+que\s+(você\s+)?pode\s+fazer/i,
                    /o\s+que\s+(você\s+)?consegue\s+fazer/i,
                    /me\s+ajuda/i,
                    /pode\s+me\s+ajudar/i,
                    /posso\s+te\s+perguntar/i,
                    /tenho\s+uma\s+d[úu]vida/i,
                    /como\s+usar/i,
                    /n[ãa]o\s+sei\s+como\s+usar/i,
                    /primeira\s+vez/i,
                    /(começar|comecar|iniciar)/i,
                    /funcionalidades/i,
                    /recursos/i,
                    /capacidades/i,
                    /quantos\s+anos/i,
                    /quantos\s+[a-z]+/i,
                    /quanto\s+[a-z]+/i,
                    /pergunta/i,
                    /d[úu]vida/i,
                    /curiosidade/i,
                    /saber/i,
                    /conhecer/i
                ],
                priority: 1,
                handler: this.handleGreeting.bind(this)
            },

            // INTENÇÕES DE DESPESAS - PALAVRAS-CHAVE ULTRA-EXPANDIDAS
            {
                name: 'ADD_EXPENSE',
                keywords: [
                    { word: 'gastei', weight: 0.9 },
                    { word: 'desembolsei', weight: 0.9 },
                    { word: 'apliquei', weight: 0.8 },
                    { word: 'investi', weight: 0.8 },
                    { word: 'comprei', weight: 0.7 },
                    { word: 'saquei', weight: 0.7 },
                    { word: 'retirei', weight: 0.7 },
                    { word: 'mandei', weight: 0.6 },
                    { word: 'enviei', weight: 0.6 },
                    { word: 'foi', weight: 0.4 },
                    { word: 'debitou', weight: 0.8 },
                    { word: 'despesa', weight: 0.6 },
                    { word: 'gasto', weight: 0.6 },
                    { word: 'paguei', weight: 0.3 }, // MUITO REDUZIDO para evitar conflito
                    { word: 'paguei para', weight: 0.8 },
                    { word: 'paguei no', weight: 0.7 },
                    { word: 'paguei na', weight: 0.7 },
                    { word: 'paguei em', weight: 0.7 },
                    { word: 'paguei com', weight: 0.7 },
                    // PALAVRAS-CHAVE BRASILEIRAS
                    { word: 'gasolina', weight: 0.8 },
                    { word: 'farmácia', weight: 0.8 },
                    { word: 'farmacia', weight: 0.8 },
                    { word: 'supermercado', weight: 0.8 },
                    { word: 'mercado', weight: 0.8 },
                    { word: 'ifood', weight: 0.8 },
                    { word: 'rappi', weight: 0.8 },
                    { word: 'uber', weight: 0.8 },
                    { word: 'taxi', weight: 0.8 },
                    { word: 'ônibus', weight: 0.7 },
                    { word: 'onibus', weight: 0.7 },
                    { word: 'metrô', weight: 0.7 },
                    { word: 'metro', weight: 0.7 },
                    { word: 'restaurante', weight: 0.7 },
                    { word: 'delivery', weight: 0.7 },
                    { word: 'lanchonete', weight: 0.7 },
                    { word: 'padaria', weight: 0.7 },
                    { word: 'açougue', weight: 0.7 },
                    { word: 'acougue', weight: 0.7 },
                    { word: 'hortifruti', weight: 0.7 },
                    { word: 'posto', weight: 0.7 },
                    { word: 'posto de gasolina', weight: 0.8 },
                    { word: 'combustível', weight: 0.7 },
                    { word: 'combustivel', weight: 0.7 },
                    // EXPRESSÕES COLOQUIAIS
                    { word: 'pila', weight: 0.6 },
                    { word: 'contos', weight: 0.6 },
                    { word: 'grana', weight: 0.6 },
                    { word: 'um trocado', weight: 0.5 },
                    { word: 'uns trocados', weight: 0.5 }
                ],
                patterns: [
                    /gastei\s+R?\$?\s*\d+/i,
                    /paguei\s+R?\$?\s*\d+/i,
                    /foi\s+R?\$?\s*\d+/i,
                    /mandei\s+R?\$?\s*\d+/i,
                    /enviei\s+R?\$?\s*\d+/i,
                    /comprei\s+.+\s+por\s+R?\$?\s*\d+/i,
                    /paguei\s+(?:a|o|para)\s+.+/i
                ],
                priority: 6,
                handler: this.handleAddExpense.bind(this)
            },

            // INTENÇÕES DE PAGAMENTO DE CONTAS FIXAS
            {
                name: 'PAY_FIXED_BILL',
                keywords: [
                    { word: 'paguei o', weight: 0.9 },
                    { word: 'paguei a', weight: 0.9 },
                    { word: 'paguei', weight: 0.7 },
                    { word: 'acabei de pagar', weight: 0.8 },
                    { word: 'acabei de pagar o', weight: 0.9 },
                    { word: 'acabei de pagar a', weight: 0.9 },
                    { word: 'quitei o', weight: 0.8 },
                    { word: 'quitei a', weight: 0.8 },
                    { word: 'quitei', weight: 0.6 },
                    { word: 'paguei hoje o', weight: 0.8 },
                    { word: 'paguei hoje a', weight: 0.8 },
                    { word: 'paguei agora o', weight: 0.8 },
                    { word: 'paguei agora a', weight: 0.8 },
                    { word: 'conta fixa', weight: 0.8 },
                    { word: 'conta recorrente', weight: 0.7 },
                    { word: 'aluguel', weight: 0.8 },
                    { word: 'energia', weight: 0.8 },
                    { word: 'luz', weight: 0.8 },
                    { word: 'energia elétrica', weight: 0.8 },
                    { word: 'energia eletrica', weight: 0.8 },
                    { word: 'conta de luz', weight: 0.8 },
                    { word: 'agua', weight: 0.8 },
                    { word: 'água', weight: 0.8 },
                    { word: 'conta de água', weight: 0.8 },
                    { word: 'conta de agua', weight: 0.8 },
                    { word: 'saneamento', weight: 0.7 },
                    { word: 'internet', weight: 0.8 },
                    { word: 'wifi', weight: 0.7 },
                    { word: 'banda larga', weight: 0.7 },
                    { word: 'telefone', weight: 0.8 },
                    { word: 'celular', weight: 0.7 },
                    { word: 'plano celular', weight: 0.8 },
                    { word: 'gas', weight: 0.8 },
                    { word: 'gás', weight: 0.8 },
                    { word: 'conta de gás', weight: 0.8 },
                    { word: 'conta de gas', weight: 0.8 },
                    { word: 'seguro', weight: 0.8 },
                    { word: 'seguro carro', weight: 0.8 },
                    { word: 'seguro auto', weight: 0.8 },
                    { word: 'seguro residencial', weight: 0.8 },
                    { word: 'escola', weight: 0.8 },
                    { word: 'mensalidade', weight: 0.8 },
                    { word: 'faculdade', weight: 0.8 },
                    { word: 'universidade', weight: 0.8 },
                    { word: 'cartao', weight: 0.8 },
                    { word: 'cartão', weight: 0.8 },
                    { word: 'cartão de crédito', weight: 0.8 },
                    { word: 'cartao de credito', weight: 0.8 },
                    { word: 'fatura do cartão', weight: 0.8 },
                    { word: 'fatura do cartao', weight: 0.8 },
                    { word: 'streaming', weight: 0.8 },
                    { word: 'netflix', weight: 0.7 },
                    { word: 'spotify', weight: 0.7 },
                    { word: 'amazon prime', weight: 0.7 },
                    { word: 'disney plus', weight: 0.7 },
                    { word: 'academia', weight: 0.8 },
                    { word: 'saude', weight: 0.8 },
                    { word: 'saúde', weight: 0.8 },
                    { word: 'lazer', weight: 0.8 },
                    { word: 'vestuario', weight: 0.8 },
                    { word: 'vestuário', weight: 0.8 },
                    { word: 'condominio', weight: 0.8 },
                    { word: 'condomínio', weight: 0.8 },
                    { word: 'financiamento', weight: 0.8 },
                    { word: 'parcela', weight: 0.7 },
                    { word: 'prestação', weight: 0.7 },
                    { word: 'prestacao', weight: 0.7 },
                    { word: 'boleto', weight: 0.7 },
                    { word: 'fatura', weight: 0.7 },
                    { word: 'conta de', weight: 0.6 },
                    { word: 'conta do', weight: 0.6 },
                    { word: 'conta da', weight: 0.6 },
                    { word: 'quitei', weight: 0.7 },
                    { word: 'quitei o', weight: 0.8 },
                    { word: 'quitei a', weight: 0.8 },
                    { word: 'quitei a conta', weight: 0.9 },
                    { word: 'quitei o boleto', weight: 0.9 },
                    { word: 'quitei a fatura', weight: 0.9 },
                    { word: 'quitei a prestação', weight: 0.9 },
                    { word: 'quitei a prestacao', weight: 0.9 },
                    { word: 'quitei a parcela', weight: 0.9 },
                    { word: 'paguei a conta', weight: 0.9 },
                    { word: 'paguei o boleto', weight: 0.9 },
                    { word: 'paguei a fatura', weight: 0.9 },
                    { word: 'paguei a prestação', weight: 0.9 },
                    { word: 'paguei a prestacao', weight: 0.9 },
                    { word: 'paguei a parcela', weight: 0.9 },
                    { word: 'paguei com', weight: 0.8 },
                    { word: 'paguei no', weight: 0.8 },
                    { word: 'paguei na', weight: 0.8 },
                    { word: 'paguei usando', weight: 0.8 },
                    { word: 'paguei pelo', weight: 0.8 },
                    { word: 'paguei pela', weight: 0.8 },
                    { word: 'paguei', weight: 0.9 }  // Aumentado de 0.7 para 0.9
                ],
                patterns: [
                    /paguei\s+(?:o|a)\s+(.+)/i,
                    /paguei\s+(.+?)\s+(?:com|no|na|usando|pelo|pela)\s+(.+)/i,
                    /paguei\s+(?:a|o)\s+(.+?)\s+(?:com|no|na|usando|pelo|pela)\s+(.+)/i,
                    /quitei\s+(?:o|a)\s+(.+)/i,
                    /quitei\s+(.+?)\s+(?:com|no|na|usando|pelo|pela)\s+(.+)/i,
                    /quitei\s+(?:a|o)\s+(.+?)\s+(?:com|no|na|usando|pelo|pela)\s+(.+)/i,
                    /(?:conta|boleto|fatura|prestação|prestacao|parcela)\s+(?:de|do|da)\s+(.+)/i,
                    /paguei\s+(.+)/i,  // NOVO: captura "paguei gg"
                    /quitei\s+(.+)/i   // NOVO: captura "quitei gg"
                ],
                priority: 5, // Prioridade muito maior que ADD_EXPENSE
                handler: this.handlePayFixedBill.bind(this)
            },

            // INTENÇÕES DE RECEITAS - PALAVRAS-CHAVE ULTRA-EXPANDIDAS
            {
                name: 'ADD_INCOME',
                keywords: [
                    { word: 'recebi', weight: 0.9 },
                    { word: 'ganhei', weight: 0.8 },
                    { word: 'caiu', weight: 0.7 },
                    { word: 'entrou', weight: 0.7 },
                    { word: 'pingou', weight: 0.6 },
                    { word: 'chegou', weight: 0.7 },
                    { word: 'depositei', weight: 0.7 },
                    { word: 'depósito', weight: 0.6 },
                    { word: 'deposito', weight: 0.6 },
                    { word: 'transferiram', weight: 0.7 },
                    { word: 'me enviaram', weight: 0.7 },
                    { word: 'me mandaram', weight: 0.7 },
                    { word: 'salário', weight: 0.8 },
                    { word: 'salario', weight: 0.8 },
                    { word: 'receita', weight: 0.6 },
                    { word: 'renda', weight: 0.6 },
                    { word: 'provento', weight: 0.6 },
                    { word: 'proventos', weight: 0.6 },
                    { word: 'pagamento', weight: 0.6 },
                    { word: 'pagamentos', weight: 0.6 },
                    { word: 'bonus', weight: 0.6 },
                    { word: 'bônus', weight: 0.6 },
                    { word: 'comissão', weight: 0.6 },
                    { word: 'comissao', weight: 0.6 },
                    { word: 'freelance', weight: 0.6 },
                    { word: 'freela', weight: 0.6 },
                    { word: 'venda', weight: 0.6 },
                    { word: 'vendas', weight: 0.6 },
                    { word: 'lucro', weight: 0.6 },
                    { word: 'lucros', weight: 0.6 },
                    { word: 'dividendo', weight: 0.6 },
                    { word: 'dividendos', weight: 0.6 },
                    { word: 'juros', weight: 0.6 },
                    { word: 'rendimento', weight: 0.6 },
                    { word: 'rendimentos', weight: 0.6 },
                    // EXPRESSÕES COLOQUIAIS
                    { word: 'caiu na conta', weight: 0.8 },
                    { word: 'entrou na conta', weight: 0.8 },
                    { word: 'pingou na conta', weight: 0.7 },
                    { word: 'chegou na conta', weight: 0.7 },
                    { word: 'caiu no banco', weight: 0.7 },
                    { word: 'entrou no banco', weight: 0.7 },
                    { word: 'pingou no banco', weight: 0.6 },
                    { word: 'chegou no banco', weight: 0.6 }
                ],
                patterns: [
                    /recebi\s+R?\$?\s*\d+/i,
                    /ganhei\s+R?\$?\s*\d+/i,
                    /caiu\s+R?\$?\s*\d+/i,
                    /entrou\s+R?\$?\s*\d+/i,
                    /pingou\s+R?\$?\s*\d+/i,
                    /salário\s+de\s+R?\$?\s*\d+/i,
                    /depositei\s+R?\$?\s*\d+/i,
                    /transferiram\s+R?\$?\s*\d+/i,
                    /me\s+enviaram\s+R?\$?\s*\d+/i
                ],
                priority: 6,
                handler: this.handleAddIncome.bind(this)
            },

            // INTENÇÕES DE TRANSFERÊNCIA - PALAVRAS-CHAVE ULTRA-EXPANDIDAS
            {
                name: 'PERFORM_TRANSFER',
                keywords: [
                    { word: 'transferir', weight: 0.9 },
                    { word: 'transferi', weight: 0.9 },
                    { word: 'transfira', weight: 0.9 },
                    { word: 'mover', weight: 0.7 },
                    { word: 'movi', weight: 0.7 },
                    { word: 'mova', weight: 0.7 },
                    { word: 'movimentar', weight: 0.7 },
                    { word: 'movimentei', weight: 0.7 },
                    { word: 'movimenta', weight: 0.7 },
                    { word: 'migrar', weight: 0.7 },
                    { word: 'migrei', weight: 0.7 },
                    { word: 'migra', weight: 0.7 },
                    { word: 'passar', weight: 0.6 },
                    { word: 'passei', weight: 0.6 },
                    { word: 'passe', weight: 0.6 },
                    { word: 'enviar', weight: 0.6 },
                    { word: 'mandei', weight: 0.6 },
                    { word: 'manda', weight: 0.6 },
                    { word: 'mandar', weight: 0.6 },
                    { word: 'transferi para', weight: 0.8 },
                    { word: 'de uma conta para outra', weight: 0.8 },
                    { word: 'entre contas', weight: 0.7 },
                    { word: 'do', weight: 0.5 },
                    { word: 'para', weight: 0.5 },
                    { word: 'reais', weight: 0.3 },
                    { word: 'contos', weight: 0.3 },
                    { word: 'pila', weight: 0.3 },
                    { word: 'grana', weight: 0.3 },
                    // EXPRESSÕES COLOQUIAIS
                    { word: 'passou', weight: 0.6 },
                    { word: 'passou de', weight: 0.7 },
                    { word: 'passou para', weight: 0.7 },
                    { word: 'mandou', weight: 0.6 },
                    { word: 'mandou de', weight: 0.7 },
                    { word: 'mandou para', weight: 0.7 },
                    { word: 'enviou', weight: 0.6 },
                    { word: 'enviou de', weight: 0.7 },
                    { word: 'enviou para', weight: 0.7 }
                ],
                patterns: [
                    /transferir\s+R?\$?\s*[\d,]+\s+(?:reais?|de|do)/i,
                    /transferi\s+R?\$?\s*[\d,]+\s+(?:reais?|de|do)/i,
                    /transfira\s+R?\$?\s*[\d,]+\s+(?:reais?|de|do)/i,
                    /mover\s+R?\$?\s*[\d,]+\s+(?:reais?|de|do)/i,
                    /movi\s+R?\$?\s*[\d,]+\s+(?:reais?|de|do)/i,
                    /mova\s+R?\$?\s*[\d,]+\s+(?:reais?|de|do)/i,
                    /transferir\s+[\d,]+\s+reais/i,
                    /transferi\s+[\d,]+\s+reais/i,
                    /transfira\s+[\d,]+\s+reais/i,
                    /[\d,]+\s+reais\s+do\s+.+\s+para\s+.+/i,
                    /transferir\s+[\d,]+\s+do\s+.+\s+para\s+.+/i,
                    /transferi\s+[\d,]+\s+do\s+.+\s+para\s+.+/i,
                    /transfira\s+[\d,]+\s+reais?\s+do\s+.+\s+para\s+.+/i,
                    /transferir\s+R?\$?\s*[\d,]+\s+de\s+.+\s+para\s+.+/i,
                    /transferi\s+R?\$?\s*[\d,]+\s+de\s+.+\s+para\s+.+/i,
                    /transfira\s+R?\$?\s*[\d,]+\s+de\s+.+\s+para\s+.+/i,
                    /mover\s+R?\$?\s*[\d,]+\s+de\s+.+\s+para\s+.+/i,
                    /movi\s+R?\$?\s*[\d,]+\s+de\s+.+\s+para\s+.+/i,
                    /mova\s+R?\$?\s*[\d,]+\s+de\s+.+\s+para\s+.+/i
                ],
                priority: 6,
                handler: this.handleTransfer.bind(this)
            },

            // INTENÇÕES DE CONSULTA DE SALDO
            {
                name: 'QUERY_BALANCE',
                keywords: [
                    { word: 'saldo', weight: 0.9 },
                    { word: 'quanto tenho', weight: 0.8 },
                    { word: 'quanto eu tenho', weight: 0.8 },
                    { word: 'quanto tem na', weight: 0.8 },
                    { word: 'quanto tem no', weight: 0.8 },
                    { word: 'quanto tem em', weight: 0.8 },
                    { word: 'verba', weight: 0.6 },
                    { word: 'grana', weight: 0.6 },
                    { word: 'dinheiro', weight: 0.5 },
                    { word: 'quanto tem', weight: 0.7 },
                    { word: 'meu saldo', weight: 0.9 },
                    { word: 'saldo atual', weight: 0.8 },
                    { word: 'saldo disponível', weight: 0.8 },
                    { word: 'saldo disponivel', weight: 0.8 },
                    { word: 'quanto sobra', weight: 0.7 },
                    { word: 'quanto falta', weight: 0.6 },
                    { word: 'disponível', weight: 0.6 },
                    { word: 'disponivel', weight: 0.6 },
                    { word: 'quanto tenho na conta', weight: 0.8 },
                    { word: 'quanto tenho no banco', weight: 0.8 },
                    { word: 'quanto ta na conta', weight: 0.7 },
                    { word: 'quanto está na conta', weight: 0.7 },
                    { word: 'quanto tem guardado', weight: 0.7 },
                    { word: 'quanto tenho guardado', weight: 0.7 },
                    { word: 'posso gastar', weight: 0.7 },
                    { word: 'tenho para gastar', weight: 0.7 },
                    { word: 'total disponível', weight: 0.8 },
                    { word: 'total disponivel', weight: 0.8 }
                ],
                patterns: [
                    /qual\s+(?:o\s+)?saldo/i,
                    /quanto\s+tenho/i,
                    /quanto\s+tem/i,
                    /quanto\s+sobra/i,
                    /quanto\s+falta/i,
                    /saldo\s+(?:da\s+)?(?:conta\s+)?(.+)/i
                ],
                priority: 1,
                handler: this.handleQueryBalance.bind(this)
            },

            // INTENÇÕES DE RESUMO E RELATÓRIOS
            {
                name: 'QUERY_SUMMARY',
                keywords: [
                    { word: 'resumo', weight: 0.8 },
                    { word: 'relatório', weight: 0.7 },
                    { word: 'relatorio', weight: 0.7 },
                    { word: 'extrato', weight: 0.7 },
                    { word: 'gastos do mês', weight: 0.8 },
                    { word: 'gastos do mes', weight: 0.8 },
                    { word: 'receitas do mês', weight: 0.8 },
                    { word: 'receitas do mes', weight: 0.8 },
                    { word: 'quanto gastei', weight: 0.7 },
                    { word: 'quanto eu gastei', weight: 0.7 },
                    { word: 'quanto gastei total', weight: 0.7 },
                    { word: 'qual foi meu gasto', weight: 0.7 },
                    { word: 'quais foram meus gastos', weight: 0.7 },
                    { word: 'quanto recebi', weight: 0.7 },
                    { word: 'quanto eu recebi', weight: 0.7 },
                    { word: 'balanço', weight: 0.7 },
                    { word: 'balanco', weight: 0.7 },
                    { word: 'relatório mensal', weight: 0.8 },
                    { word: 'relatorio mensal', weight: 0.8 },
                    { word: 'resumo financeiro', weight: 0.9 },
                    { word: 'estatísticas', weight: 0.7 },
                    { word: 'estatisticas', weight: 0.7 },
                    { word: 'resumo de hoje', weight: 0.8 },
                    { word: 'resumo diário', weight: 0.8 },
                    { word: 'resumo diario', weight: 0.8 },
                    { word: 'resumo mensal', weight: 0.8 },
                    { word: 'movimentação de hoje', weight: 0.8 },
                    { word: 'movimentacao de hoje', weight: 0.8 },
                    { word: 'movimentação de ontem', weight: 0.8 },
                    { word: 'movimentacao de ontem', weight: 0.8 },
                    { word: 'histórico de hoje', weight: 0.9 },
                    { word: 'historico de hoje', weight: 0.9 },
                    { word: 'histórico de ontem', weight: 0.9 },
                    { word: 'historico de ontem', weight: 0.9 },
                    { word: 'histórico semanal', weight: 0.8 },
                    { word: 'historico semanal', weight: 0.8 },
                    { word: 'histórico mensal', weight: 0.8 },
                    { word: 'historico mensal', weight: 0.8 },
                    { word: 'histórico anual', weight: 0.8 },
                    { word: 'historico anual', weight: 0.8 },
                    { word: 'resumo semanal', weight: 0.8 },
                    { word: 'resumo anual', weight: 0.8 },
                    { word: 'resumo de ontem', weight: 0.8 },
                    { word: 'resumo de hoje', weight: 0.8 },
                    { word: 'fluxo de caixa', weight: 0.7 },
                    { word: 'fluxo de caixa hoje', weight: 0.8 },
                    { word: 'fluxo de caixa ontem', weight: 0.8 },
                    { word: 'fluxo de caixa do mês', weight: 0.8 },
                    { word: 'fluxo de caixa do mes', weight: 0.8 },
                    { word: 'dinheiro que entrou', weight: 0.7 },
                    { word: 'dinheiro que saiu', weight: 0.7 },
                    { word: 'grana que entrou', weight: 0.6 },
                    { word: 'grana que saiu', weight: 0.6 },
                    { word: 'verba que entrou', weight: 0.6 },
                    { word: 'verba que saiu', weight: 0.6 },
                    { word: 'pila que entrou', weight: 0.5 },
                    { word: 'pila que saiu', weight: 0.5 },
                    { word: 'contos que entrou', weight: 0.5 },
                    { word: 'contos que saiu', weight: 0.5 }
                ],
                patterns: [
                    /resumo\s+(?:do\s+)?(?:mês|mes)/i,
                    /resumo\s+(?:diário|diario)/i,
                    /resumo\s+(?:semanal|anual)/i,
                    /histórico\s+(?:semanal|mensal|anual)/i,
                    /historico\s+(?:semanal|mensal|anual)/i,
                    /gastos\s+(?:do\s+)?(?:mês|mes)/i,
                    /receitas\s+(?:do\s+)?(?:mês|mes)/i,
                    /quanto\s+gastei\s+(?:total|no\s+mês|no\s+mes)/i,
                    /quanto\s+recebi\s+(?:total|no\s+mês|no\s+mes)/i,
                    /relatório\s+(?:do\s+)?(?:mês|mes)/i,
                    /balanço\s+(?:do\s+)?(?:mês|mes)/i,
                    /fluxo\s+de\s+caixa/i,
                    /dinheiro\s+que\s+(?:entrou|saiu)/i,
                    /grana\s+que\s+(?:entrou|saiu)/i,
                    /verba\s+que\s+(?:entrou|saiu)/i,
                    /pila\s+que\s+(?:entrou|saiu)/i,
                    /contos\s+que\s+(?:entrou|saiu)/i
                ],
                priority: 1,
                handler: this.handleQuerySummary.bind(this)
            },

            // INTENÇÕES DE CONSULTA DE CONTAS FIXAS
            {
                name: 'QUERY_UNPAID_BILLS',
                keywords: [
                    { word: 'não paguei', weight: 0.9 },
                    { word: 'nao paguei', weight: 0.9 },
                    { word: 'não paguei ainda', weight: 0.9 },
                    { word: 'nao paguei ainda', weight: 0.9 },
                    { word: 'ainda não paguei', weight: 0.9 },
                    { word: 'ainda nao paguei', weight: 0.9 },
                    { word: 'não consegui pagar', weight: 0.8 },
                    { word: 'nao consegui pagar', weight: 0.8 },
                    { word: 'esqueci de pagar', weight: 0.8 },
                    { word: 'faltou pagar', weight: 0.8 },
                    { word: 'não quitei', weight: 0.8 },
                    { word: 'nao quitei', weight: 0.8 },
                    { word: 'contas não pagas', weight: 0.8 },
                    { word: 'contas nao pagas', weight: 0.8 },
                    { word: 'contas pendentes', weight: 0.7 },
                    { word: 'contas fixas não pagas', weight: 0.8 },
                    { word: 'contas fixas nao pagas', weight: 0.8 },
                    { word: 'qual conta não paguei', weight: 0.8 },
                    { word: 'qual conta nao paguei', weight: 0.8 },
                    { word: 'contas vencidas', weight: 0.7 },
                    { word: 'contas atrasadas', weight: 0.7 },
                    { word: 'o que falta pagar', weight: 0.7 },
                    { word: 'o que preciso pagar', weight: 0.7 },
                    { word: 'que contas tenho para pagar', weight: 0.8 },
                    { word: 'que contas preciso pagar', weight: 0.8 },
                    { word: 'quais contas vencem', weight: 0.7 },
                    { word: 'quais contas vão vencer', weight: 0.7 },
                    { word: 'contas para este mês', weight: 0.7 },
                    { word: 'contas deste mês', weight: 0.7 },
                    { word: 'contas do mês', weight: 0.7 },
                    { word: 'minhas contas fixas', weight: 0.7 },
                    { word: 'tenho que pagar', weight: 0.7 },
                    { word: 'preciso pagar', weight: 0.7 },
                    { word: 'em aberto', weight: 0.6 },
                    { word: 'tenho contas para pagar', weight: 0.9 },
                    { word: 'tenho contas para pagar?', weight: 0.9 },
                    { word: 'deixei de pagar alguma conta', weight: 0.9 },
                    { word: 'deixei de pagar alguma conta?', weight: 0.9 },
                    { word: 'quais contas estão atrasadas', weight: 0.9 },
                    { word: 'quais contas estão atrasadas?', weight: 0.9 },
                    { word: 'liste as contas atrasadas', weight: 0.9 },
                    { word: 'liste as contas prestes a atrasar', weight: 0.9 },
                    { word: 'tenho alguma conta vencida', weight: 0.9 },
                    { word: 'tenho alguma conta vencida?', weight: 0.9 },
                    { word: 'alguma conta vencida', weight: 0.8 },
                    { word: 'alguma conta vencida?', weight: 0.8 },
                    { word: 'tenho conta vencida', weight: 0.8 },
                    { word: 'tenho conta vencida?', weight: 0.8 },
                    { word: 'conta vencida', weight: 0.7 },
                    { word: 'conta vencida?', weight: 0.7 },
                    { word: 'tenho alguma conta atrasada', weight: 0.9 },
                    { word: 'tenho alguma conta atrasada?', weight: 0.9 },
                    { word: 'alguma conta atrasada', weight: 0.8 },
                    { word: 'alguma conta atrasada?', weight: 0.8 },
                    { word: 'tenho conta atrasada', weight: 0.8 },
                    { word: 'tenho conta atrasada?', weight: 0.8 },
                    { word: 'conta atrasada', weight: 0.7 },
                    { word: 'conta atrasada?', weight: 0.7 },
                    { word: 'tenho alguma conta em atraso', weight: 0.8 },
                    { word: 'tenho alguma conta em atraso?', weight: 0.8 },
                    { word: 'conta em atraso', weight: 0.7 },
                    { word: 'conta em atraso?', weight: 0.7 },
                    { word: 'tenho alguma conta em falta', weight: 0.8 },
                    { word: 'tenho alguma conta em falta?', weight: 0.8 },
                    { word: 'conta em falta', weight: 0.7 },
                    { word: 'conta em falta?', weight: 0.7 },
                    { word: 'tenho alguma conta pendente', weight: 0.8 },
                    { word: 'tenho alguma conta pendente?', weight: 0.8 },
                    { word: 'alguma conta pendente', weight: 0.7 },
                    { word: 'alguma conta pendente?', weight: 0.7 },
                    { word: 'tenho conta pendente', weight: 0.7 },
                    { word: 'tenho conta pendente?', weight: 0.7 },
                    { word: 'conta pendente', weight: 0.6 },
                    { word: 'conta pendente?', weight: 0.6 },
                    { word: 'tenho alguma conta', weight: 0.6 },
                    { word: 'tenho alguma conta?', weight: 0.6 },
                    { word: 'alguma conta', weight: 0.5 },
                    { word: 'alguma conta?', weight: 0.5 },
                    { word: 'tenho conta', weight: 0.5 },
                    { word: 'tenho conta?', weight: 0.5 },
                    { word: 'conta', weight: 0.3 },
                    { word: 'conta?', weight: 0.3 }
                ],
                patterns: [
                    /(?:não|nao)\s+paguei/i,
                    /contas?\s+(?:não|nao)\s+pagas?/i,
                    /contas?\s+pendentes/i,
                    /contas?\s+vencidas/i,
                    /contas?\s+atrasadas/i,
                    /tenho\s+contas?\s+para\s+pagar/i,
                    /deixei\s+de\s+pagar/i,
                    /quais\s+contas?\s+estão\s+atrasadas/i,
                    /liste\s+as\s+contas?\s+atrasadas/i,
                    /liste\s+as\s+contas?\s+prestes\s+a\s+atrasar/i,
                    /tenho\s+alguma\s+conta\s+vencida/i,
                    /alguma\s+conta\s+vencida/i,
                    /tenho\s+conta\s+vencida/i,
                    /conta\s+vencida/i,
                    /tenho\s+alguma\s+conta\s+atrasada/i,
                    /alguma\s+conta\s+atrasada/i,
                    /tenho\s+conta\s+atrasada/i,
                    /conta\s+atrasada/i,
                    /tenho\s+alguma\s+conta\s+em\s+atraso/i,
                    /conta\s+em\s+atraso/i,
                    /tenho\s+alguma\s+conta\s+em\s+falta/i,
                    /conta\s+em\s+falta/i,
                    /tenho\s+alguma\s+conta\s+pendente/i,
                    /alguma\s+conta\s+pendente/i,
                    /tenho\s+conta\s+pendente/i,
                    /conta\s+pendente/i,
                    /tenho\s+alguma\s+conta/i,
                    /alguma\s+conta/i,
                    /tenho\s+conta/i,
                    /conta/i
                ],
                priority: 6,
                handler: this.handleQueryUnpaidBills.bind(this)
            },

            // INTENÇÕES DE CONSULTA DE CONTAS PAGAS
            {
                name: 'QUERY_PAID_BILLS',
                keywords: [
                    { word: 'quais contas eu paguei esse mês', weight: 0.9 },
                    { word: 'quais contas eu paguei esse mês?', weight: 0.9 },
                    { word: 'contas pagas este mês', weight: 0.8 },
                    { word: 'contas pagas este mes', weight: 0.8 },
                    { word: 'o que já paguei', weight: 0.7 },
                    { word: 'o que ja paguei', weight: 0.7 },
                    { word: 'contas em dia', weight: 0.7 },
                    { word: 'contas quitadas', weight: 0.7 },
                    { word: 'contas pagas', weight: 0.8 },
                    { word: 'paguei este mês', weight: 0.6 },
                    { word: 'paguei este mes', weight: 0.6 },
                    { word: 'quais contas paguei', weight: 0.8 },
                    { word: 'contas que paguei', weight: 0.7 },
                    { word: 'pagamentos feitos', weight: 0.6 },
                    { word: 'pagamentos realizados', weight: 0.6 },
                    { word: 'paguei alguma conta', weight: 0.9 },
                    { word: 'paguei alguma conta?', weight: 0.9 },
                    { word: 'alguma conta paguei', weight: 0.8 },
                    { word: 'alguma conta eu paguei', weight: 0.8 }
                ],
                patterns: [
                    /quais\s+contas?\s+eu\s+paguei/i,
                    /quais\s+contas?\s+paguei/i,
                    /contas?\s+pagas?\s+este\s+mês/i,
                    /contas?\s+pagas?\s+este\s+mes/i,
                    /o\s+que\s+(?:já|ja)\s+paguei/i,
                    /contas?\s+em\s+dia/i,
                    /contas?\s+quitadas/i,
                    /contas?\s+que\s+paguei/i,
                    /paguei\s+este\s+mês/i,
                    /paguei\s+este\s+mes/i,
                    /pagamentos?\s+(?:feitos|realizados)/i,
                    /paguei\s+alguma\s+conta/i,
                    /alguma\s+conta\s+(?:eu\s+)?paguei/i
                ],
                priority: 6,
                handler: this.handleQueryPaidBills.bind(this)
            },

            // INTENÇÕES DE CONSULTA DE DÍVIDAS
            {
                name: 'QUERY_DEBTS',
                keywords: [
                    { word: 'dívidas', weight: 0.9 },
                    { word: 'dividas', weight: 0.9 },
                    { word: 'devo', weight: 0.8 },
                    { word: 'estou devendo', weight: 0.6 }, // Reduzido para evitar conflito com ADD_DEBT
                    { word: 'to devendo', weight: 0.6 }, // Reduzido para evitar conflito com ADD_DEBT
                    { word: 'emprestado', weight: 0.5 }, // Reduzido para evitar conflito com ADD_DEBT
                    { word: 'peguei emprestado', weight: 0.5 }, // Reduzido para evitar conflito com ADD_DEBT
                    { word: 'pedi emprestado', weight: 0.5 }, // Reduzido para evitar conflito com ADD_DEBT
                    { word: 'quanto devo', weight: 0.9 },
                    { word: 'quanto estou devendo', weight: 0.9 },
                    { word: 'quanto to devendo', weight: 0.9 },
                    { word: 'minhas dívidas', weight: 0.8 },
                    { word: 'minhas dividas', weight: 0.8 },
                    { word: 'o que devo', weight: 0.8 },
                    { word: 'quem devo', weight: 0.8 },
                    { word: 'quem eu devo', weight: 0.8 },
                    { word: 'para quem devo', weight: 0.8 },
                    { word: 'quanto eu devo', weight: 0.9 },
                    { word: 'quanto eu estou devendo', weight: 0.9 },
                    { word: 'quanto eu to devendo', weight: 0.9 },
                    { word: 'lista de dívidas', weight: 0.8 },
                    { word: 'lista de dividas', weight: 0.8 },
                    { word: 'relatório de dívidas', weight: 0.8 },
                    { word: 'relatorio de dividas', weight: 0.8 },
                    { word: 'resumo de dívidas', weight: 0.8 },
                    { word: 'resumo de dividas', weight: 0.8 },
                    { word: 'balanço de dívidas', weight: 0.8 },
                    { word: 'balanco de dividas', weight: 0.8 },
                    { word: 'extrato de dívidas', weight: 0.8 },
                    { word: 'extrato de dividas', weight: 0.8 },
                    { word: 'dívidas pendentes', weight: 0.8 },
                    { word: 'dividas pendentes', weight: 0.8 },
                    { word: 'dívidas em aberto', weight: 0.8 },
                    { word: 'dividas em aberto', weight: 0.8 },
                    { word: 'dívidas ativas', weight: 0.8 },
                    { word: 'dividas ativas', weight: 0.8 },
                    { word: 'dívidas não pagas', weight: 0.8 },
                    { word: 'dividas nao pagas', weight: 0.8 },
                    { word: 'dívidas não quitadas', weight: 0.8 },
                    { word: 'dividas nao quitadas', weight: 0.8 },
                    { word: 'dívidas não saldadas', weight: 0.8 },
                    { word: 'dividas nao saldadas', weight: 0.8 },
                    { word: 'dívidas não liquidadas', weight: 0.8 },
                    { word: 'dividas nao liquidadas', weight: 0.8 },
                    { word: 'dívidas não resolvidas', weight: 0.8 },
                    { word: 'dividas nao resolvidas', weight: 0.8 },
                    { word: 'dívidas não finalizadas', weight: 0.8 },
                    { word: 'dividas nao finalizadas', weight: 0.8 },
                    { word: 'dívidas não concluídas', weight: 0.8 },
                    { word: 'dividas nao concluidas', weight: 0.8 },
                    { word: 'dívidas não encerradas', weight: 0.8 },
                    { word: 'dividas nao encerradas', weight: 0.8 },
                    { word: 'dívidas não fechadas', weight: 0.8 },
                    { word: 'dividas nao fechadas', weight: 0.8 },
                    { word: 'dívidas não terminadas', weight: 0.8 },
                    { word: 'dividas nao terminadas', weight: 0.8 },
                    { word: 'dívidas não completadas', weight: 0.8 },
                    { word: 'dividas nao completadas', weight: 0.8 },
                    { word: 'dívidas não finalizadas', weight: 0.8 },
                    { word: 'dividas nao finalizadas', weight: 0.8 },
                    { word: 'dívidas não concluídas', weight: 0.8 },
                    { word: 'dividas nao concluidas', weight: 0.8 },
                    { word: 'dívidas não encerradas', weight: 0.8 },
                    { word: 'dividas nao encerradas', weight: 0.8 },
                    { word: 'dívidas não fechadas', weight: 0.8 },
                    { word: 'dividas nao fechadas', weight: 0.8 },
                    { word: 'dívidas não terminadas', weight: 0.8 },
                    { word: 'dividas nao terminadas', weight: 0.8 },
                    { word: 'dívidas não completadas', weight: 0.8 },
                    { word: 'dividas nao completadas', weight: 0.8 }
                ],
                patterns: [
                    /quanto\s+(?:estou|to|eu\s+estou|eu\s+to)\s+devendo/i,
                    /quanto\s+(?:devo|eu\s+devo)/i,
                    /minhas?\s+d[ií]vidas?/i,
                    /o\s+que\s+devo/i,
                    /quem\s+devo/i,
                    /para\s+quem\s+devo/i,
                    /lista\s+de\s+d[ií]vidas?/i,
                    /relatório\s+de\s+d[ií]vidas?/i,
                    /resumo\s+de\s+d[ií]vidas?/i,
                    /balanço\s+de\s+d[ií]vidas?/i,
                    /extrato\s+de\s+d[ií]vidas?/i,
                    /d[ií]vidas?\s+(?:pendentes|em\s+aberto|ativas|n[ãa]o\s+(?:pagas|quitadas|saldadas|liquidadas|resolvidas|finalizadas|concluídas|encerradas|fechadas|terminadas|completadas))/i
                ],
                priority: 1,
                handler: this.handleQueryDebts.bind(this)
            },

            // INTENÇÕES DE CONFIGURAÇÃO E PREFERÊNCIAS
            {
                name: 'SETTINGS',
                keywords: [
                    { word: 'configuração', weight: 0.8 },
                    { word: 'configuracao', weight: 0.8 },
                    { word: 'preferências', weight: 0.7 },
                    { word: 'preferencias', weight: 0.7 },
                    { word: 'configurar', weight: 0.7 },
                    { word: 'ajustar', weight: 0.6 },
                    { word: 'personalizar', weight: 0.6 },
                    { word: 'opções', weight: 0.6 },
                    { word: 'opcoes', weight: 0.6 }
                ],
                patterns: [
                    /configuração/i,
                    /preferências/i,
                    /configurar/i,
                    /ajustar/i
                ],
                priority: 1,
                handler: this.handleSettings.bind(this)
            },

            // INTENÇÕES DE DÍVIDAS E EMPRÉSTIMOS
            {
                name: 'ADD_DEBT',
                keywords: [
                    { word: 'devo', weight: 0.9 },
                    { word: 'estou devendo', weight: 0.9 },
                    { word: 'to devendo', weight: 0.9 },
                    { word: 'devo a', weight: 0.9 },
                    { word: 'devo para', weight: 0.9 },
                    { word: 'emprestado', weight: 0.8 },
                    { word: 'peguei emprestado', weight: 0.8 },
                    { word: 'pedi emprestado', weight: 0.8 },
                    { word: 'deve', weight: 0.7 },
                    { word: 'dívida', weight: 0.7 },
                    { word: 'divida', weight: 0.7 },
                    { word: 'fiquei devendo', weight: 0.8 },
                    { word: 'ficou devendo', weight: 0.8 }
                ],
                patterns: [
                    /(?:estou|to)\s+devendo\s+(?:a|para)\s+(.+?)\s+(?:R?\$?\s*)?(\d+[.,]?\d*)/i,
                    /devo\s+(?:a|para)\s+(.+?)\s+(?:R?\$?\s*)?(\d+[.,]?\d*)/i,
                    /(?:peguei|pedi)\s+emprestado\s+(?:R?\$?\s*)?(\d+[.,]?\d*)\s+(?:de|com)\s+(.+)/i,
                    /(?:R?\$?\s*)?(\d+[.,]?\d*)\s+(?:de|com)\s+(.+?)\s+(?:emprestado|emprestou)/i
                ],
                priority: 6,
                handler: this.handleAddDebt.bind(this)
            },

            // INTENÇÕES DE ANÁLISE E INSIGHTS
            // INTENÇÕES ESPECÍFICAS PARA CONSULTAS POR PERÍODO
            {
                name: 'QUERY_DAILY_EXPENSES',
                keywords: [
                    { word: 'quanto gastei hoje', weight: 1.0 },
                    { word: 'quanto gastei ontem', weight: 1.0 },
                    { word: 'quanto eu gastei hoje', weight: 1.0 },
                    { word: 'quanto eu gastei ontem', weight: 1.0 },
                    { word: 'gastos de hoje', weight: 0.9 },
                    { word: 'gastos de ontem', weight: 0.9 },
                    { word: 'meus gastos de hoje', weight: 0.9 },
                    { word: 'meus gastos de ontem', weight: 0.9 },
                    { word: 'o que gastei hoje', weight: 0.8 },
                    { word: 'o que gastei ontem', weight: 0.8 },
                    { word: 'quanto saiu hoje', weight: 0.8 },
                    { word: 'quanto saiu ontem', weight: 0.8 },
                    { word: 'despesas de hoje', weight: 0.8 },
                    { word: 'despesas de ontem', weight: 0.8 },
                    { word: 'saídas de hoje', weight: 0.7 },
                    { word: 'saidas de hoje', weight: 0.7 },
                    { word: 'saídas de ontem', weight: 0.7 },
                    { word: 'saidas de ontem', weight: 0.7 }
                ],
                patterns: [
                    /quanto\s+(?:eu\s+)?gastei\s+(?:hoje|ontem)/i,
                    /gastos\s+(?:de\s+)?(?:hoje|ontem)/i,
                    /o\s+que\s+gastei\s+(?:hoje|ontem)/i,
                    /quanto\s+saiu\s+(?:hoje|ontem)/i,
                    /despesas\s+(?:de\s+)?(?:hoje|ontem)/i,
                    /saídas\s+(?:de\s+)?(?:hoje|ontem)/i,
                    /saidas\s+(?:de\s+)?(?:hoje|ontem)/i
                ],
                priority: 6,
                handler: this.handleDailyExpenses.bind(this)
            },
            {
                name: 'QUERY_DAILY_INCOME',
                keywords: [
                    { word: 'quanto recebi hoje', weight: 1.0 },
                    { word: 'quanto recebi ontem', weight: 1.0 },
                    { word: 'quanto eu recebi hoje', weight: 1.0 },
                    { word: 'quanto eu recebi ontem', weight: 1.0 },
                    { word: 'quantos recebi hoje', weight: 1.0 },
                    { word: 'quantos recebi ontem', weight: 1.0 },
                    { word: 'quanto ganhei hoje', weight: 0.9 },
                    { word: 'quanto ganhei ontem', weight: 0.9 },
                    { word: 'receitas de hoje', weight: 0.9 },
                    { word: 'receitas de ontem', weight: 0.9 },
                    { word: 'entradas de hoje', weight: 0.8 },
                    { word: 'entradas de ontem', weight: 0.8 },
                    { word: 'quanto entrou hoje', weight: 0.8 },
                    { word: 'quanto entrou ontem', weight: 0.8 },
                    { word: 'dinheiro que entrou hoje', weight: 0.7 },
                    { word: 'dinheiro que entrou ontem', weight: 0.7 }
                ],
                patterns: [
                    /quanto\s+(?:eu\s+)?recebi\s+(?:hoje|ontem)/i,
                    /quantos\s+(?:eu\s+)?recebi\s+(?:hoje|ontem)/i,
                    /quanto\s+ganhei\s+(?:hoje|ontem)/i,
                    /receitas\s+(?:de\s+)?(?:hoje|ontem)/i,
                    /entradas\s+(?:de\s+)?(?:hoje|ontem)/i,
                    /quanto\s+entrou\s+(?:hoje|ontem)/i,
                    /dinheiro\s+que\s+entrou\s+(?:hoje|ontem)/i
                ],
                priority: 6,
                handler: this.handleDailyIncome.bind(this)
            },
            {
                name: 'QUERY_DAILY_TRANSFERS',
                keywords: [
                    { word: 'quantas transferências fiz hoje', weight: 1.0 },
                    { word: 'quantas transferencias fiz hoje', weight: 1.0 },
                    { word: 'quantas transferências fiz ontem', weight: 1.0 },
                    { word: 'quantas transferencias fiz ontem', weight: 1.0 },
                    { word: 'quantos transferi hoje', weight: 1.0 },
                    { word: 'quantos transferi ontem', weight: 1.0 },
                    { word: 'quantas transferi hoje', weight: 1.0 },
                    { word: 'quantas transferi ontem', weight: 1.0 },
                    { word: 'quantos transfiri hoje', weight: 1.0 },
                    { word: 'quantos transfiri ontem', weight: 1.0 },
                    { word: 'quantas transfiri hoje', weight: 1.0 },
                    { word: 'quantas transfiri ontem', weight: 1.0 },
                    { word: 'transferências de hoje', weight: 0.9 },
                    { word: 'transferencias de hoje', weight: 0.9 },
                    { word: 'transferências de ontem', weight: 0.9 },
                    { word: 'transferencias de ontem', weight: 0.9 },
                    { word: 'movimentações de hoje', weight: 0.8 },
                    { word: 'movimentacoes de hoje', weight: 0.8 },
                    { word: 'movimentações de ontem', weight: 0.8 },
                    { word: 'movimentacoes de ontem', weight: 0.8 },
                    { word: 'quais transferências fiz hoje', weight: 0.8 },
                    { word: 'quais transferencias fiz hoje', weight: 0.8 },
                    { word: 'quais transferências fiz ontem', weight: 0.8 },
                    { word: 'quais transferencias fiz ontem', weight: 0.8 }
                ],
                patterns: [
                    /quantas\s+transferências?\s+fiz\s+(?:hoje|ontem)/i,
                    /quantos\s+transferi\s+(?:hoje|ontem)/i,
                    /quantas\s+transferi\s+(?:hoje|ontem)/i,
                    /quantos\s+transfiri\s+(?:hoje|ontem)/i,
                    /quantas\s+transfiri\s+(?:hoje|ontem)/i,
                    /transferências?\s+(?:de\s+)?(?:hoje|ontem)/i,
                    /movimentações?\s+(?:de\s+)?(?:hoje|ontem)/i,
                    /quais\s+transferências?\s+fiz\s+(?:hoje|ontem)/i
                ],
                priority: 6,
                handler: this.handleDailyTransfers.bind(this)
            },

            {
                name: 'ANALYTICS',
                keywords: [
                    { word: 'análise', weight: 0.8 },
                    { word: 'analise', weight: 0.8 },
                    { word: 'insights', weight: 0.7 },
                    { word: 'tendências', weight: 0.7 },
                    { word: 'tendencias', weight: 0.7 },
                    { word: 'padrões', weight: 0.7 },
                    { word: 'padroes', weight: 0.7 },
                    { word: 'comportamento', weight: 0.6 },
                    { word: 'gastos recorrentes', weight: 0.8 },
                    { word: 'receitas recorrentes', weight: 0.8 },
                    { word: 'categoria que mais gasto', weight: 0.8 },
                    { word: 'onde mais gasto', weight: 0.7 }
                ],
                patterns: [
                    /análise\s+(?:dos\s+)?gastos/i,
                    /tendências\s+(?:dos\s+)?gastos/i,
                    /padrões\s+(?:de\s+)?gastos/i,
                    /onde\s+mais\s+gasto/i,
                    /categoria\s+que\s+mais\s+gasto/i
                ],
                priority: 1,
                handler: this.handleAnalytics.bind(this)
            },

            // INTENÇÕES DE ANÁLISE COMPARATIVA MENSAL
            {
                name: 'MONTHLY_COMPARISON',
                keywords: [
                    { word: 'comparar', weight: 0.9 },
                    { word: 'comparação', weight: 0.8 },
                    { word: 'comparacao', weight: 0.8 },
                    { word: 'mês passado', weight: 0.9 },
                    { word: 'mes passado', weight: 0.9 },
                    { word: 'mês anterior', weight: 0.8 },
                    { word: 'mes anterior', weight: 0.8 },
                    { word: 'diferença', weight: 0.7 },
                    { word: 'diferenca', weight: 0.7 },
                    { word: 'aumentou', weight: 0.7 },
                    { word: 'diminuiu', weight: 0.7 },
                    { word: 'cresceu', weight: 0.6 },
                    { word: 'reduziu', weight: 0.6 }
                ],
                patterns: [
                    /comparar\s+(?:com\s+)?(?:o\s+)?mês\s+passado/i,
                    /comparar\s+(?:com\s+)?(?:o\s+)?mes\s+passado/i,
                    /comparação\s+(?:com\s+)?(?:o\s+)?mês\s+passado/i,
                    /comparacao\s+(?:com\s+)?(?:o\s+)?mes\s+passado/i,
                    /diferença\s+(?:do\s+)?mês\s+passado/i,
                    /diferenca\s+(?:do\s+)?mes\s+passado/i,
                    /quanto\s+(?:aumentou|diminuiu|cresceu|reduziu)\s+(?:em\s+relação\s+ao\s+)?mês\s+passado/i,
                    /quanto\s+(?:aumentou|diminuiu|cresceu|reduziu)\s+(?:em\s+relacao\s+ao\s+)?mes\s+passado/i
                ],
                priority: 4,
                handler: this.handleMonthlyComparison.bind(this)
            },

            // INTENÇÕES DE SUGESTÕES DE ECONOMIA
            {
                name: 'SAVINGS_SUGGESTIONS',
                keywords: [
                    { word: 'sugestão', weight: 0.8 },
                    { word: 'sugestao', weight: 0.8 },
                    { word: 'economia', weight: 0.9 },
                    { word: 'economizar', weight: 0.8 },
                    { word: 'poupar', weight: 0.8 },
                    { word: 'guardar', weight: 0.7 },
                    { word: 'reduzir', weight: 0.7 },
                    { word: 'cortar', weight: 0.6 },
                    { word: 'dica', weight: 0.6 },
                    { word: 'dicas', weight: 0.6 },
                    { word: 'como economizar', weight: 0.9 },
                    { word: 'onde cortar', weight: 0.7 },
                    { word: 'onde reduzir', weight: 0.7 }
                ],
                patterns: [
                    /sugestão\s+(?:de\s+)?economia/i,
                    /sugestao\s+(?:de\s+)?economia/i,
                    /como\s+economizar/i,
                    /onde\s+(?:cortar|reduzir)/i,
                    /dicas?\s+(?:de\s+)?economia/i,
                    /como\s+poupar/i,
                    /onde\s+guardar/i,
                    /reduzir\s+gastos/i,
                    /cortar\s+gastos/i
                ],
                priority: 4,
                handler: this.handleSavingsSuggestions.bind(this)
            }
        ];
    }

    // Método principal de classificação com sistema anti-conflito ULTRA-RIGOROSO
    classify(text, context) {
        const textLower = text.toLowerCase();
        let bestIntent = null;
        let bestScore = 0;
        let debugScores = [];
        let conflictPrevention = new ConflictPreventionSystem();

        // PRIMEIRA CAMADA: Calcular scores de todas as intenções
        for (let intent of this.intentions) {
            let score = this.calculateIntentScore(textLower, intent, context);
            debugScores.push({ name: intent.name, score: score });
            
            if (score > bestScore) {
                bestScore = score;
                bestIntent = intent;
            }
        }

        // SEGUNDA CAMADA: Aplicar sistema anti-conflito ULTRA-RIGOROSO
        const topIntents = debugScores
            .sort((a, b) => b.score - a.score)
            .slice(0, 3) // Top 3 intenções
            .filter(intent => intent.score > 0.1); // Filtrar scores muito baixos

        if (topIntents.length >= 2) {
            // Verificar se há conflito entre as top intenções
            const intent1 = topIntents[0];
            const intent2 = topIntents[1];
            
            // Se a diferença de score for menor que 0.2, aplicar resolução de conflito
            if (Math.abs(intent1.score - intent2.score) < 0.2) {
                console.log('🛡️ CONFLITO DETECTADO:', intent1.name, 'vs', intent2.name);
                
                const resolution = conflictPrevention.resolveConflict(
                    intent1.name, 
                    intent2.name, 
                    text, 
                    context
                );
                
                // Encontrar a intenção resolvida
                bestIntent = this.intentions.find(i => i.name === resolution.intent);
                bestScore = resolution.confidence;
                
                console.log(`🛡️ CONFLITO RESOLVIDO: ${intent1.name} vs ${intent2.name} -> ${resolution.intent} (confiança: ${resolution.confidence})`);
            }
        }

        // TERCEIRA CAMADA: Validação final com padrões de exclusão
        if (bestIntent) {
            const validation = conflictPrevention.validateIntent(bestIntent.name, text, context);
            
            if (!validation.valid) {
                console.log(`❌ INTENÇÃO INVALIDA: ${bestIntent.name} (confiança: ${validation.confidence})`);
                
                // Tentar segunda melhor intenção
                if (topIntents.length >= 2) {
                    const secondIntent = this.intentions.find(i => i.name === topIntents[1].name);
                    const secondValidation = conflictPrevention.validateIntent(secondIntent.name, text, context);
                    
                    if (secondValidation.valid) {
                        bestIntent = secondIntent;
                        bestScore = secondValidation.confidence;
                        console.log(`✅ SEGUNDA INTENÇÃO VÁLIDA: ${secondIntent.name} (confiança: ${secondValidation.confidence})`);
                    }
                }
            }
        }

        // QUARTA CAMADA: Verificar se a confiança é suficiente
        if (bestScore < this.confidenceThreshold) {
            return {
                intent: this.fallbackIntent,
                confidence: bestScore,
                handler: this.handleUnknown.bind(this)
            };
        }

        // Debug: mostrar scores de todas as intenções
        console.log('🔍 Debug - Scores de intenções:', debugScores.sort((a, b) => b.score - a.score));

        return {
            intent: bestIntent.name,
            confidence: bestScore,
            handler: bestIntent.handler
        };
    }

    // Calcular score de intenção
    calculateIntentScore(text, intent, context) {
        let score = 0;

        // Análise de contexto inteligente (PESO PRINCIPAL)
        const contextScore = this.analyzeContext(text, intent);
        score += contextScore;

        // Score baseado em keywords (peso reduzido)
        for (let keyword of intent.keywords) {
            if (text.includes(keyword.word)) {
                score += keyword.weight * 0.3; // Reduzido para dar mais peso ao contexto
            }
        }

        // Score baseado em patterns (peso alto)
        for (let pattern of intent.patterns) {
            if (pattern.test(text)) {
                score += 2.0; // Alto peso para padrões regex
            }
        }

        // Score baseado no contexto de sessão
        if (context && context.sessionData.lastIntent === intent.name) {
            score += 0.3; // Boost para continuidade
        }

        // Score baseado na prioridade
        score += intent.priority * 0.2;

        // Boost especial para PAY_FIXED_BILL quando há contas fixas disponíveis
        if (intent.name === 'PAY_FIXED_BILL' && context && context.fixedBills && context.fixedBills.length > 0) {
            // Verificar se o texto contém nomes de contas fixas
            const textLower = text.toLowerCase();
            for (let bill of context.fixedBills) {
                const billName = bill.name || bill.description;
                if (billName && textLower.includes(billName.toLowerCase())) {
                    score += 2.0; // Boost significativo quando encontra nome de conta fixa
                    break;
                }
            }
        }

        return score;
    }

    // Análise de contexto inteligente
    analyzeContext(text, intent) {
        const textLower = text.toLowerCase();
        let contextScore = 0;

        // Análise específica para cada tipo de intenção
        switch (intent.name) {
            case 'QUERY_DAILY_EXPENSES':
                // "quantos gastei", "quanto gastei", "gastos de hoje"
                if (textLower.includes('gastei') && (textLower.includes('hoje') || textLower.includes('ontem'))) {
                    contextScore += 4.0;
                }
                if (textLower.includes('gastos') && (textLower.includes('hoje') || textLower.includes('ontem'))) {
                    contextScore += 3.5;
                }
                if (textLower.includes('quanto') && textLower.includes('gastei')) {
                    contextScore += 3.0;
                }
                if (textLower.includes('quantos') && textLower.includes('gastei')) {
                    contextScore += 3.0;
                }
                break;

            case 'QUERY_DAILY_INCOME':
                // "quantos recebi", "quanto recebi", "receitas de hoje"
                if (textLower.includes('recebi') && (textLower.includes('hoje') || textLower.includes('ontem'))) {
                    contextScore += 4.0;
                }
                if (textLower.includes('receitas') && (textLower.includes('hoje') || textLower.includes('ontem'))) {
                    contextScore += 3.5;
                }
                if (textLower.includes('quanto') && textLower.includes('recebi')) {
                    contextScore += 3.0;
                }
                if (textLower.includes('quantos') && textLower.includes('recebi')) {
                    contextScore += 3.0;
                }
                if (textLower.includes('ganhei') && (textLower.includes('hoje') || textLower.includes('ontem'))) {
                    contextScore += 3.0;
                }
                break;

            case 'QUERY_DAILY_TRANSFERS':
                // "quantos transfiri", "transferências de hoje"
                if ((textLower.includes('transfiri') || textLower.includes('transferi')) && 
                    (textLower.includes('hoje') || textLower.includes('ontem'))) {
                    contextScore += 4.0;
                }
                if (textLower.includes('transferências') && (textLower.includes('hoje') || textLower.includes('ontem'))) {
                    contextScore += 3.5;
                }
                if (textLower.includes('quantos') && (textLower.includes('transfiri') || textLower.includes('transferi'))) {
                    contextScore += 3.0;
                }
                break;

            case 'ADD_EXPENSE':
                // "gastei X", "paguei X", mas NÃO "quanto gastei"
                if (textLower.includes('gastei') && !textLower.includes('quanto') && !textLower.includes('quantos')) {
                    contextScore += 2.0;
                }
                if (textLower.includes('paguei') && !textLower.includes('quanto') && !textLower.includes('quantos') && 
                    !textLower.includes('o ') && !textLower.includes('a ')) {
                    contextScore += 2.0;
                }
                // Penalizar se for pergunta
                if (textLower.includes('quanto') || textLower.includes('quantos')) {
                    contextScore -= 3.0;
                }
                break;

            case 'ADD_INCOME':
                // "recebi X", "ganhei X", mas NÃO "quanto recebi"
                if (textLower.includes('recebi') && !textLower.includes('quanto') && !textLower.includes('quantos')) {
                    contextScore += 2.0;
                }
                if (textLower.includes('ganhei') && !textLower.includes('quanto') && !textLower.includes('quantos')) {
                    contextScore += 2.0;
                }
                if (textLower.includes('caiu') && !textLower.includes('quanto') && !textLower.includes('quantos')) {
                    contextScore += 1.5;
                }
                if (textLower.includes('entrou') && !textLower.includes('quanto') && !textLower.includes('quantos')) {
                    contextScore += 1.5;
                }
                // Penalizar se for pergunta
                if (textLower.includes('quanto') || textLower.includes('quantos')) {
                    contextScore -= 3.0;
                }
                break;

            case 'PERFORM_TRANSFER':
                // "transfira X", "transferi X", mas NÃO "quantos transfiri"
                if ((textLower.includes('transfira') || textLower.includes('transferi')) && 
                    !textLower.includes('quantos') && !textLower.includes('quanto')) {
                    contextScore += 2.0;
                }
                if (textLower.includes('mover') && !textLower.includes('quantos') && !textLower.includes('quanto')) {
                    contextScore += 1.5;
                }
                // Penalizar se for pergunta
                if (textLower.includes('quantos') || textLower.includes('quanto')) {
                    contextScore -= 3.0;
                }
                break;

            case 'PAY_FIXED_BILL':
                // "paguei o/a X", "acabei de pagar X"
                if (textLower.includes('paguei o ') || textLower.includes('paguei a ')) {
                    contextScore += 3.0;
                }
                if (textLower.includes('acabei de pagar')) {
                    contextScore += 2.5;
                }
                if (textLower.includes('paguei') && (textLower.includes('o ') || textLower.includes('a '))) {
                    contextScore += 2.0;
                }
                // Penalizar se for pergunta
                if (textLower.includes('quanto') || textLower.includes('quantos')) {
                    contextScore -= 3.0;
                }
                break;

            case 'QUERY_BALANCE':
                // "saldo", "quanto tenho", "quanto tem na"
                if (textLower.includes('saldo')) {
                    contextScore += 3.0;
                }
                if (textLower.includes('quanto tenho') || textLower.includes('quanto eu tenho')) {
                    contextScore += 2.5;
                }
                if (textLower.includes('quanto tem na')) {
                    contextScore += 2.0;
                }
                break;

            case 'QUERY_SUMMARY':
                // "resumo", "relatório", "extrato", mas NÃO perguntas específicas
                if (textLower.includes('resumo') || textLower.includes('relatório') || textLower.includes('relatorio')) {
                    contextScore += 2.5;
                }
                if (textLower.includes('extrato') || textLower.includes('análise') || textLower.includes('analise')) {
                    contextScore += 2.0;
                }
                // Penalizar perguntas específicas de hoje/ontem
                if ((textLower.includes('hoje') || textLower.includes('ontem')) && 
                    (textLower.includes('quanto') || textLower.includes('quantos'))) {
                    contextScore -= 2.0;
                }
                break;

            case 'QUERY_UNPAID_BILLS':
                // "não paguei", "contas em aberto"
                if (textLower.includes('não paguei') || textLower.includes('nao paguei')) {
                    contextScore += 3.0;
                }
                if (textLower.includes('contas em aberto') || textLower.includes('contas pendentes')) {
                    contextScore += 2.5;
                }
                if (textLower.includes('o que não paguei') || textLower.includes('o que nao paguei')) {
                    contextScore += 2.0;
                }
                break;

            case 'QUERY_PAID_BILLS':
                // "contas pagas", "o que paguei"
                if (textLower.includes('contas pagas') || textLower.includes('contas que paguei')) {
                    contextScore += 3.0;
                }
                if (textLower.includes('o que paguei') || textLower.includes('quais contas eu paguei')) {
                    contextScore += 2.5;
                }
                if (textLower.includes('paguei esse mês') || textLower.includes('paguei esse mes')) {
                    contextScore += 2.0;
                }
                break;

            case 'QUERY_DEBTS':
                // "dívidas", "devo", mas NÃO "estou devendo X"
                if (textLower.includes('dívidas') || textLower.includes('dividas')) {
                    contextScore += 3.0;
                }
                if (textLower.includes('devo') && !textLower.includes('estou devendo')) {
                    contextScore += 2.0;
                }
                if (textLower.includes('quais dívidas') || textLower.includes('quais dividas')) {
                    contextScore += 2.5;
                }
                // Penalizar se for adicionar dívida
                if (textLower.includes('estou devendo') || textLower.includes('to devendo')) {
                    contextScore -= 2.0;
                }
                break;

            case 'ADD_DEBT':
                // "estou devendo X", "devo X para Y"
                if (textLower.includes('estou devendo') || textLower.includes('to devendo')) {
                    contextScore += 3.0;
                }
                if (textLower.includes('devo a ') || textLower.includes('devo para ')) {
                    contextScore += 2.5;
                }
                // Penalizar se for consultar dívidas
                if (textLower.includes('quais dívidas') || textLower.includes('quais dividas')) {
                    contextScore -= 2.0;
                }
                break;

            case 'SETTINGS':
                // "configuração", "preferências"
                if (textLower.includes('configuração') || textLower.includes('configuracao')) {
                    contextScore += 2.5;
                }
                if (textLower.includes('preferências') || textLower.includes('preferencias')) {
                    contextScore += 2.0;
                }
                if (textLower.includes('ajustes') || textLower.includes('configurar')) {
                    contextScore += 1.5;
                }
                break;

            case 'ANALYTICS':
                // "análise", "insights", "tendências"
                if (textLower.includes('análise') || textLower.includes('analise')) {
                    contextScore += 2.5;
                }
                if (textLower.includes('insights') || textLower.includes('tendências') || textLower.includes('tendencias')) {
                    contextScore += 2.0;
                }
                if (textLower.includes('relatório detalhado') || textLower.includes('relatorio detalhado')) {
                    contextScore += 2.5;
                }
                break;

            case 'GREETING':
                // Saudações e ajuda
                if (textLower.includes('oi') || textLower.includes('olá') || textLower.includes('ola')) {
                    contextScore += 2.0;
                }
                if (textLower.includes('bom dia') || textLower.includes('boa tarde') || textLower.includes('boa noite')) {
                    contextScore += 2.5;
                }
                if (textLower.includes('ajuda') || textLower.includes('como funciona')) {
                    contextScore += 2.0;
                }
                break;
        }

        return contextScore;
    }

    // Método para normalizar texto e melhorar reconhecimento
    normalizeText(text) {
        return text
            .replace(/[^\w\s]/g, ' ') // Remove pontuação
            .replace(/\s+/g, ' ') // Remove espaços extras
            .trim()
            .toLowerCase();
    }

    // Handlers de intenções
    handleGreeting(text, user, accounts, fixedBills, context) {
        context.sessionData.lastIntent = 'GREETING';
        
        // Normalizar texto para melhor reconhecimento
        const normalizedText = this.normalizeText(text);
        const textLower = normalizedText.toLowerCase();
        
        // Saudação personalizada baseada na hora do dia
        const hour = new Date().getHours();
        let greeting = '';
        
        if (hour >= 5 && hour < 12) {
            greeting = 'Bom dia!';
        } else if (hour >= 12 && hour < 18) {
            greeting = 'Boa tarde!';
        } else {
            greeting = 'Boa noite!';
        }
        
        // Respostas concisas baseadas na saudação
        let message = '';
        
        // Detectar perguntas sobre funcionalidades usando texto normalizado
        const isFunctionQuestion = textLower.includes('funcoes') || 
                                  textLower.includes('funcionalidades') || 
                                  textLower.includes('recursos') || 
                                  textLower.includes('capacidades') || 
                                  textLower.includes('o que voce pode fazer') ||
                                  textLower.includes('o que voce consegue fazer') ||
                                  (textLower.includes('quais') && textLower.includes('funcoes')) ||
                                  (textLower.includes('quais') && textLower.includes('sua')) ||
                                  (textLower.includes('quais') && textLower.includes('suas'));
        
        if (isFunctionQuestion) {
            
            message = `${greeting} Sou o Dinah, seu assistente financeiro inteligente! 🤖\n\n` +
                     `**💡 Minhas principais funcionalidades:**\n\n` +
                     `**💸 Registrar Despesas:** "Gastei 50 reais com gasolina"\n` +
                     `**💰 Registrar Receitas:** "Recebi 1000 reais"\n` +
                     `**📋 Pagar Contas Fixas:** "Paguei o aluguel"\n` +
                     `**🔄 Transferências:** "Transferi 100 reais do Nubank para Itaú"\n` +
                     `**📊 Consultas:** "Qual meu saldo?", "Quais contas não paguei?"\n` +
                     `**📈 Análises:** "Análise dos meus gastos", "Comparação com mês passado"\n` +
                     `**💡 Sugestões:** "Sugestões de economia"\n` +
                     `**💳 Dívidas:** "Estou devendo 50 reais para farmácia"\n\n` +
                     `**🎯 Posso entender linguagem natural e fazer análises inteligentes!**\n\n` +
                     `Clique no botão "Ajuda" no topo para ver todos os exemplos! 😊`;
                     
        } else if (textLower.includes('quantos anos') || textLower.includes('quantos') || 
                   textLower.includes('quanto') || textLower.includes('pergunta') || 
                   textLower.includes('duvida') || textLower.includes('curiosidade') || 
                   textLower.includes('saber') || textLower.includes('conhecer') ||
                   (textLower.includes('quantos') && textLower.includes('tenho')) ||
                   (textLower.includes('quanto') && textLower.includes('tenho'))) {
            
            message = `${greeting} Sou o Dinah, seu assistente financeiro! 🤖\n\n` +
                     `**💡 Posso ajudar você com:**\n` +
                     `• Organizar suas finanças\n` +
                     `• Registrar gastos e receitas\n` +
                     `• Controlar contas fixas\n` +
                     `• Fazer transferências\n` +
                     `• Análises financeiras\n` +
                     `• Sugestões de economia\n\n` +
                     `**🎯 Exemplos de comandos:**\n` +
                     `• "Gastei 50 reais com gasolina"\n` +
                     `• "Qual meu saldo?"\n` +
                     `• "Análise dos meus gastos"\n\n` +
                     `Como posso ajudar você hoje? 😊`;
                     
        } else if (textLower.includes('oi') || textLower.includes('olá') || textLower.includes('ola')) {
            const responses = [
                `${greeting} Oi! Como posso ajudar? 😊`,
                `${greeting} Olá! Pronto para organizar suas finanças? 💰`,
                `${greeting} Oi! Vamos cuidar do seu dinheiro hoje? 💪`
            ];
            message = responses[Math.floor(Math.random() * responses.length)];
        } else if (textLower.includes('bom dia') || textLower.includes('boa tarde') || textLower.includes('boa noite')) {
            message = `${greeting} Que prazer ter você aqui! Como posso ajudar? 😊`;
        } else {
            message = `${greeting} Sou o Dinah, seu assistente financeiro! Como posso ajudar? 🤖`;
        }

        return {
            type: 'response',
            payload: { message }
        };
    }

        handleAddExpense(text, user, accounts, fixedBills, context) {
        context.sessionData.lastIntent = 'ADD_EXPENSE';
        
        const entityExtractor = new AdvancedEntityExtractor();
        const amount = entityExtractor.extractMoney(text);
        const account = entityExtractor.extractAccount(text, accounts);
        const category = entityExtractor.extractCategory(text);
        const description = entityExtractor.extractDescription(text, accounts.map(acc => acc.name.toLowerCase().split(' ')).flat());
        const date = entityExtractor.extractDate(text);
        
        
        // Verificar se é uma transferência para pessoa
        const isTransferToPerson = text.toLowerCase().includes('mandei') || 
                                  text.toLowerCase().includes('enviei') ||
                                  (text.toLowerCase().includes('para') && 
                                   (text.toLowerCase().includes('mãe') || 
                                    text.toLowerCase().includes('mae') ||
                                    text.toLowerCase().includes('pai') ||
                                    text.toLowerCase().includes('amigo') ||
                                    text.toLowerCase().includes('amiga')));
        
        if (!amount) {
            context.addPendingQuestion('AMOUNT_CLARIFICATION', {
                action: 'ADD_EXPENSE',
                type: 'expense',
                isTransferToPerson,
                category
            }, 2);
            
            return {
                type: 'clarification',
                payload: {
                    message: 'Quanto você gastou? 💰\n\nVocê pode dizer:\n• "R$ 50"\n• "cinquenta reais"\n• "50 contos"\n• "10" (apenas o número)'
                }
            };
        }
        
        if (!description || description.length < 3) {
            context.addPendingQuestion('DESCRIPTION_CLARIFICATION', {
                action: 'ADD_EXPENSE',
                amount,
                type: 'expense',
                isTransferToPerson,
                category
            }, 2);
            
            return {
                type: 'clarification',
                payload: {
                    message: 'Em quê você gastou esse dinheiro? 📝\n\nExemplos:\n• "No mercado"\n• "Comida"\n• "Uber"'
                }
            };
        }
        
        if (!account) {
            // Verificar se há contas com saldo suficiente
            const accountsWithBalance = accounts.filter(acc => (acc.balance || 0) >= amount);
            
            if (accountsWithBalance.length === 0) {
                return {
                    type: 'response',
                    payload: {
                        message: `❌ **Saldo insuficiente!**\n\n` +
                                 `💰 **Valor necessário:** R$ ${(amount || 0).toFixed(2)}\n\n` +
                                 `**Suas contas:**\n${accounts.map(acc => `• ${acc.name}: R$ ${(acc.balance || 0).toFixed(2)}`).join('\n')}\n\n` +
                                 `💡 **Soluções:**\n` +
                                 `• Adicione dinheiro em uma conta\n` +
                                 `• Use uma conta diferente`
                    }
                };
            }
            
            context.addPendingQuestion('SELECT_ACCOUNT', {
                action: 'ADD_EXPENSE',
                amount,
                description,
                type: 'expense',
                isTransferToPerson,
                category,
                date // <-- Adicione esta linha para salvar a data extraída
            }, 2);
            
            return {
                type: 'clarification',
                payload: {
                    message: `De qual conta você quer debitar R$ ${(amount || 0).toFixed(2)}? 🏦\n\n**Escolha uma conta:**`,
                    buttons: accountsWithBalance.map(acc => ({
                        text: `${acc.name} - R$ ${(acc.balance || 0).toFixed(2)}`,
                        value: acc.name,
                        disabled: false,
                        style: 'success'
                    }))
                }
            };
        }
        
        
        return {
            type: 'action',
            payload: {
                action: 'ADD_TRANSACTION',
                data: {
                    accountId: account.id,
                    amount,
                    description,
                    type: 'expense',
                    category: isTransferToPerson ? 'transferencia_pessoal' : (category || 'outros'),
                    date: date || new Date() // Enviar objeto Date diretamente, sem conversão ISO
                }
            }
        };
    }

    handlePayFixedBill(text, user, accounts, fixedBills, context) {
        context.sessionData.lastIntent = 'PAY_FIXED_BILL';
        
        const entityExtractor = new AdvancedEntityExtractor();
        
        // 🧠 SISTEMA INTELIGENTE: Detectar pagamento restante
        const remainingPayment = entityExtractor.detectRemainingPayment(text);
        let bill, amount, isRemainingPayment = false;
        
        if (remainingPayment.isRemainingPayment) {
            // Buscar conta fixa pelo nome extraído
            bill = fixedBills.find(b => 
                (b.description || b.name).toLowerCase().includes(remainingPayment.billName.toLowerCase()) ||
                remainingPayment.billName.toLowerCase().includes((b.description || b.name).toLowerCase())
            );
            
            if (bill) {
                isRemainingPayment = true;
                // Para pagamento restante, não especificar valor - será calculado automaticamente
                amount = null;
            }
        } else {
            // Processamento normal
            bill = entityExtractor.extractFixedBill(text, fixedBills);
            amount = entityExtractor.extractMoney(text);
        }
        
        const account = entityExtractor.extractAccount(text, accounts);
        
        if (!bill) {
            // Lista mais amigável das contas fixas disponíveis
            const billsList = fixedBills.map(b => `• **${b.description || b.name}:** R$ ${(b.amount || 0).toFixed(2)} (vencimento: dia ${b.dueDay})`).join('\n');
            
            return {
                type: 'response',
                payload: {
                    message: '❌ Não encontrei essa conta fixa. Pode verificar o nome?\n\n' +
                             '**Suas contas fixas cadastradas:**\n' + 
                             billsList + '\n\n' +
                             '**💡 Dicas para pagar contas:**\n' +
                             '• "Paguei o aluguel" (pagamento completo)\n' +
                             '• "Paguei 100 reais do aluguel" (pagamento parcial)\n' +
                             '• "Pagar restante do aluguel" (pagamento restante)\n' +
                             '• "Paguei a energia com nubank"\n' +
                             '• "Quitei a fatura do cartão"\n' +
                             '• "Paguei a prestação da casa"'
                }
            };
        }
        
        // 🧠 CÁLCULO INTELIGENTE: Determinar valor do pagamento
        let billAmount, isPartialPayment;
        
        if (isRemainingPayment) {
            // Para pagamento restante, precisamos calcular o valor restante
            // Por enquanto, vamos usar o valor total da conta (será corrigido pelo backend)
            billAmount = bill.amount;
            isPartialPayment = false; // Pagamento restante é considerado completo
        } else {
            // Se não especificou valor, usar o valor da conta fixa (pagamento completo)
            billAmount = amount || bill.amount;
            isPartialPayment = amount && amount < bill.amount;
        }
        
        if (!account) {
            // Verificar se há contas com saldo suficiente
            const accountsWithBalance = accounts.filter(acc => (acc.balance || 0) >= billAmount);
            
            if (accountsWithBalance.length === 0) {
                return {
                    type: 'response',
                    payload: {
                        message: `❌ **Saldo insuficiente!**\n\n` +
                                 `💰 **Valor necessário:** R$ ${(billAmount || 0).toFixed(2)}\n\n` +
                                 `**Suas contas:**\n${accounts.map(acc => `• ${acc.name}: R$ ${(acc.balance || 0).toFixed(2)}`).join('\n')}\n\n` +
                                 `💡 **Soluções:**\n` +
                                 `• Adicione dinheiro em uma conta\n` +
                                 `• Faça um pagamento parcial\n` +
                                 `• Use uma conta diferente`
                    }
                };
            }
            
            context.addPendingQuestion('SELECT_ACCOUNT_FOR_BILL', {
                action: 'PAY_FIXED_BILL',
                amount: billAmount,
                description: bill.description || bill.name,
                billId: bill.id,
                isPartialPayment: isPartialPayment,
                isRemainingPayment: isRemainingPayment,
                remainingAmount: isPartialPayment ? (bill.amount - amount) : 0
            }, 2);
            
            const accountOptions = accounts.map(acc => acc.name).join(', ');
            const paymentType = isRemainingPayment ? 'restante' : (isPartialPayment ? 'parcial' : 'completo');
            const remainingInfo = isPartialPayment ? `\n💰 **Valor restante:** R$ ${(bill.amount - amount).toFixed(2)}` : '';
            
            return {
                type: 'clarification',
                payload: {
                    message: `💳 Com qual conta você pagou ${bill.description || bill.name}? 🏦\n\n` +
                             `💰 **Valor pago:** R$ ${(billAmount || 0).toFixed(2)} (${paymentType})${remainingInfo}\n\n` +
                             `**Escolha uma conta:**`,
                    buttons: accountsWithBalance.map(acc => ({
                        text: `${acc.name} - R$ ${(acc.balance || 0).toFixed(2)}`,
                        value: acc.name,
                        disabled: false,
                        style: 'success'
                    }))
                }
            };
        }
        
        // Criar descrição baseada no tipo de pagamento
        const description = isPartialPayment ? 
            `${bill.description || bill.name} (pagamento parcial)` : 
            bill.description || bill.name;
        
        return {
            type: 'action',
            payload: {
                action: 'ADD_TRANSACTION',
                data: {
                    accountId: account.id,
                    amount: billAmount,
                    description: description,
                    type: 'expense',
                    category: 'contas_fixas',
                    date: new Date(),
                    isPartialPayment: isPartialPayment,
                    billId: bill.id,
                    remainingAmount: isPartialPayment ? (bill.amount - amount) : 0
                }
            }
        };
    }

    handleAddIncome(text, user, accounts, fixedBills, context) {
        context.sessionData.lastIntent = 'ADD_INCOME';
        
        const entityExtractor = new AdvancedEntityExtractor();
        const amount = entityExtractor.extractMoney(text);
        const account = entityExtractor.extractAccount(text, accounts);
        const category = entityExtractor.extractCategory(text);
        const description = entityExtractor.extractDescription(text, accounts.map(acc => acc.name.toLowerCase().split(' ')).flat());
        
        if (!amount) {
            context.addPendingQuestion('AMOUNT_CLARIFICATION', {
                action: 'ADD_INCOME',
                type: 'income',
                category
            }, 2);
            
            return {
                type: 'clarification',
                payload: {
                    message: 'Quanto você recebeu? 💰\n\nVocê pode dizer:\n• "R$ 1000"\n• "mil reais"\n• "salário"\n• "10" (apenas o número)'
                }
            };
        }
        
        if (!description || description.length < 3) {
            context.addPendingQuestion('DESCRIPTION_CLARIFICATION', {
                action: 'ADD_INCOME',
                amount,
                type: 'income',
                category
            }, 2);
            
            return {
                type: 'clarification',
                payload: {
                    message: 'De onde veio esse dinheiro? 📝\n\nExemplos:\n• "Salário"\n• "Freelance"\n• "Presente"'
                }
            };
        }
        
        if (!account) {
            context.addPendingQuestion('SELECT_ACCOUNT', {
                action: 'ADD_INCOME',
                amount,
                description,
                type: 'income',
                category
            }, 2);
            
            return {
                type: 'clarification',
                payload: {
                    message: `Em qual conta você quer creditar R$ ${(amount || 0).toFixed(2)}? 🏦\n\n**Escolha uma conta:**`,
                    buttons: accounts.map(acc => ({
                        text: `${acc.name} - R$ ${(acc.balance || 0).toFixed(2)}`,
                        value: acc.name,
                        disabled: false,
                        style: 'success'
                    }))
                }
            };
        }
        
        return {
            type: 'action',
            payload: {
                action: 'ADD_TRANSACTION',
                data: {
                    accountId: account.id,
                    amount,
                    description,
                    type: 'income',
                    category: category || 'outros',
                    date: new Date()
                }
            }
        };
    }

    handleTransfer(text, user, accounts, fixedBills, context) {
        context.sessionData.lastIntent = 'PERFORM_TRANSFER';
        
        const entityExtractor = new AdvancedEntityExtractor();
        const amount = entityExtractor.extractMoney(text);
        
        // Extrair contas de origem e destino
        const transferPattern = /(?:transferir|transferi|mover|movi)\s+R?\$?\s*[\d,]+\s+de\s+(.+?)\s+para\s+(.+)/i;
        const transferPattern2 = /[\d,]+\s+reais?\s+do\s+(.+?)\s+para\s+(.+)/i;
        const transferPattern3 = /transfira\s+[\d,]+\s+reais?\s+do\s+(.+?)\s+para\s+(.+)/i;
        const transferPattern4 = /transfira\s+R?\$?\s*[\d,]+\s+de\s+(.+?)\s+para\s+(.+)/i;
        const transferPattern5 = /transfira\s+[\d,]+\s+do\s+(.+?)\s+para\s+(.+)/i;
        const match = text.match(transferPattern) || text.match(transferPattern2) || text.match(transferPattern3) || text.match(transferPattern4) || text.match(transferPattern5);
        
        
        if (!amount) {
            context.addPendingQuestion('AMOUNT_CLARIFICATION', {
                action: 'PERFORM_TRANSFER'
            }, 2);
            
            return {
                type: 'clarification',
                payload: {
                    message: 'Quanto você quer transferir? 💰\n\nVocê pode dizer:\n• "R$ 100"\n• "cem reais"\n• "10" (apenas o número)'
                }
            };
        }
        
        if (!match) {
            context.addPendingQuestion('TRANSFER_ACCOUNTS', {
                action: 'PERFORM_TRANSFER',
                amount
            }, 2);
            
            const accountOptions = accounts.map(acc => acc.name).join(', ');
            return {
                type: 'clarification',
                payload: {
                    message: `De qual conta para qual conta você quer transferir R$ ${(amount || 0).toFixed(2)}? 🔄\n\nSuas contas: ${accountOptions}\n\n**Exemplo:** "de nubank para itau"`
                }
            };
        }
        
        const fromAccountText = match[1].trim();
        const toAccountText = match[2].trim();
        
        const fromAccount = entityExtractor.extractAccount(fromAccountText, accounts);
        const toAccount = entityExtractor.extractAccount(toAccountText, accounts);
        
        if (!fromAccount) {
            context.addPendingQuestion('SELECT_FROM_ACCOUNT', {
                action: 'PERFORM_TRANSFER',
                amount,
                toAccountText
            }, 2);
            
            const accountOptions = accounts.map(acc => acc.name).join(', ');
            return {
                type: 'clarification',
                payload: {
                    message: `De qual conta você quer transferir R$ ${(amount || 0).toFixed(2)}? 📤\n\nSuas contas: ${accountOptions}\n\n**Exemplo:** "nubank"`
                }
            };
        }
        
        if (!toAccount) {
            context.addPendingQuestion('SELECT_TO_ACCOUNT', {
                action: 'PERFORM_TRANSFER',
                amount,
                fromAccountId: fromAccount.id
            }, 2);
            
            const accountOptions = accounts.map(acc => acc.name).join(', ');
            return {
                type: 'clarification',
                payload: {
                    message: `Para qual conta você quer transferir R$ ${(amount || 0).toFixed(2)}? 📥\n\nSuas contas: ${accountOptions}\n\n**Exemplo:** "itau"`
                }
            };
        }
        
        // Verificar se as contas são diferentes
        if (fromAccount.id === toAccount.id) {
            return {
                type: 'response',
                payload: {
                    message: '❌ Não é possível transferir para a mesma conta. Escolha contas diferentes.'
                }
            };
        }
        
        return {
            type: 'action',
            payload: {
                action: 'PERFORM_TRANSFER',
                data: {
                    fromAccountId: fromAccount.id,
                    toAccountId: toAccount.id,
                    amount
                }
            }
        };
    }

    handleQueryBalance(text, user, accounts, fixedBills, context) {
        context.sessionData.lastIntent = 'QUERY_BALANCE';
        
        const entityExtractor = new AdvancedEntityExtractor();
        const account = entityExtractor.extractAccount(text, accounts);
        
        if (account) {
            return {
                type: 'response',
                payload: {
                    message: `💰 **Saldo da conta ${account.name}:** R$ ${(account.balance || 0).toFixed(2)}`
                }
            };
        } else {
            const totalBalance = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
            const accountDetails = accounts.map(acc => 
                `• ${acc.name}: R$ ${(acc.balance || 0).toFixed(2)}`
            ).join('\n');
            
            return {
                type: 'response',
                payload: {
                    message: `💰 **Resumo dos seus saldos:**\n\n**Total:** R$ ${(totalBalance || 0).toFixed(2)}\n\n**Por conta:**\n${accountDetails}`
                }
            };
        }
    }

    handleQuerySummary(text, user, accounts, fixedBills, context) {
        context.sessionData.lastIntent = 'QUERY_SUMMARY';
        
        const textLower = text.toLowerCase();
        const entityExtractor = new AdvancedEntityExtractor();
        
        // Detectar período automaticamente
        let period = 'month'; // padrão
        let date = new Date();
        
        if (textLower.includes('hoje')) {
            period = 'day';
            date = new Date();
        } else if (textLower.includes('ontem')) {
            period = 'day';
            date = new Date();
            date.setDate(date.getDate() - 1);
        } else if (textLower.includes('semana')) {
            period = 'week';
        } else if (textLower.includes('mês') || textLower.includes('mes')) {
            period = 'month';
        } else if (textLower.includes('ano')) {
            period = 'year';
        }
        
        // Detectar tipo de consulta
        let queryType = 'all'; // padrão: gastos + receitas
        if (textLower.includes('gastei') || textLower.includes('gastos') || textLower.includes('saídas') || textLower.includes('saidas') || textLower.includes('saiu')) {
            queryType = 'expenses';
        } else if (textLower.includes('recebi') || textLower.includes('receitas') || textLower.includes('entradas') || textLower.includes('entrou')) {
            queryType = 'income';
        }
        
        return {
            type: 'action',
            payload: {
                action: 'QUERY_SUMMARY',
                data: {
                    date: date,
                    period: period,
                    queryType: queryType,
                    originalText: text
                }
            }
        };
    }

    handleQueryUnpaidBills(text, user, accounts, fixedBills, context) {
        context.sessionData.lastIntent = 'QUERY_UNPAID_BILLS';
        
        if (fixedBills.length === 0) {
            return {
                type: 'response',
                payload: {
                    message: '📋 Você não tem contas fixas cadastradas.\n\n' +
                             '**Para adicionar uma conta fixa:**\n' +
                             '• Use o botão "Contas Fixas" na barra superior\n' +
                             '• Ou me diga: "Quero cadastrar uma conta fixa"\n\n' +
                             '**Exemplos de contas fixas:**\n' +
                             '• Aluguel\n' +
                             '• Energia elétrica\n' +
                             '• Água\n' +
                             '• Internet\n' +
                             '• Telefone\n' +
                             '• Cartão de crédito\n' +
                             '• Financiamento'
                }
            };
        }
        
        // Calcular status de cada conta fixa
        const billsWithStatus = fixedBills.map(bill => {
            const today = new Date();
            const currentDay = today.getDate();
            const currentMonth = today.getMonth();
            const currentYear = today.getFullYear();
            
            // Calcular data de vencimento para o mês atual
            const dueDate = new Date(currentYear, currentMonth, bill.dueDay);
            
            // Se o dia de vencimento já passou este mês, calcular para o próximo mês
            if (currentDay > bill.dueDay) {
                dueDate.setMonth(currentMonth + 1);
            }
            
            // Calcular dias até o vencimento
            const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
            
            // Determinar status
            let status, statusEmoji;
            if (daysUntilDue < 0) {
                status = 'Vencida';
                statusEmoji = '🔴';
            } else if (daysUntilDue <= 7) {
                status = 'Quase Vencendo';
                statusEmoji = '🟡';
            } else {
                status = 'Pendente';
                statusEmoji = '🟢';
            }
            
            return {
                ...bill,
                status,
                statusEmoji,
                daysUntilDue
            };
        });
        
        // Ordenar por prioridade: vencidas primeiro, depois quase vencendo, depois pendentes
        const sortedBills = billsWithStatus.sort((a, b) => {
            const priorityOrder = ['Vencida', 'Quase Vencendo', 'Pendente'];
            const priorityA = priorityOrder.indexOf(a.status);
            const priorityB = priorityOrder.indexOf(b.status);
            
            if (priorityA !== priorityB) {
                return priorityA - priorityB;
            }
            
            // Se mesmo status, ordenar por valor (mais caras primeiro)
            return (b.amount || 0) - (a.amount || 0);
        });
        
        const billsList = sortedBills.map(bill => 
            `${bill.statusEmoji} **${bill.description || bill.name}:** R$ ${(bill.amount || 0).toFixed(2)} (vencimento: dia ${bill.dueDay}) - ${bill.status}`
        ).join('\n');
        
        // Contar por status
        const overdueCount = sortedBills.filter(bill => bill.status === 'Vencida').length;
        const dueSoonCount = sortedBills.filter(bill => bill.status === 'Quase Vencendo').length;
        const pendingCount = sortedBills.filter(bill => bill.status === 'Pendente').length;
        
        let summaryMessage = `📋 **Suas contas fixas:**\n\n${billsList}\n\n`;
        
        if (overdueCount > 0) {
            summaryMessage += `⚠️ **${overdueCount} conta(s) vencida(s)** - Pague urgentemente!\n`;
        }
        if (dueSoonCount > 0) {
            summaryMessage += `🟡 **${dueSoonCount} conta(s) quase vencendo** - Pague em breve!\n`;
        }
        if (pendingCount > 0) {
            summaryMessage += `🟢 **${pendingCount} conta(s) pendente(s)** - Ainda há tempo!\n`;
        }
        
        summaryMessage += `\n**💡 Como marcar uma conta como paga:**\n` +
                         `• "Paguei o aluguel" (pagamento completo)\n` +
                         `• "Paguei 100 reais do aluguel" (pagamento parcial)\n` +
                         `• "Paguei a energia com nubank"\n` +
                         `• "Quitei a fatura do cartão"\n` +
                         `• "Paguei a prestação da casa"\n` +
                         `• "Paguei o boleto da internet"`;
        
        return {
            type: 'response',
            payload: {
                message: summaryMessage
            }
        };
    }

    handleQueryPaidBills(text, user, accounts, fixedBills, context) {
        context.sessionData.lastIntent = 'QUERY_PAID_BILLS';
        
        if (fixedBills.length === 0) {
            return {
                type: 'response',
                payload: {
                    message: '📋 Você não tem contas fixas cadastradas.\n\n' +
                             '**Para adicionar uma conta fixa:**\n' +
                             '• Use o botão "Contas Fixas" na barra superior\n' +
                             '• Ou me diga: "Quero cadastrar uma conta fixa"'
                }
            };
        }
        
        // Por enquanto, retorna uma mensagem informativa
        // Em uma implementação completa, isso consultaria o histórico de pagamentos
        return {
            type: 'response',
            payload: {
                message: '📋 **Consulta de contas pagas:**\n\n' +
                         'Esta funcionalidade está sendo desenvolvida.\n\n' +
                         '**Por enquanto, você pode:**\n' +
                         '• Ver todas as suas contas fixas\n' +
                         '• Marcar contas como pagas\n' +
                         '• Consultar contas pendentes\n\n' +
                         '**Para ver suas contas fixas:**\n' +
                         '• "Tenho contas para pagar?"\n' +
                         '• "Quais contas não paguei ainda?"'
            }
        };
    }

    handleQueryDebts(text, user, accounts, fixedBills, context) {
        context.sessionData.lastIntent = 'QUERY_DEBTS';
        
        return {
            type: 'action',
            payload: {
                action: 'QUERY_DEBTS',
                data: {
                    date: new Date(),
                    includePartialPayments: true
                }
            }
        };
    }

    handleSettings(text, user, accounts, fixedBills, context) {
        context.sessionData.lastIntent = 'SETTINGS';
        
        return {
            type: 'response',
            payload: {
                message: '⚙️ **Configurações do Dinah:**\n\n' +
                         '• **Gerenciar Contas:** Adicionar, editar ou excluir contas\n' +
                         '• **Contas Fixas:** Configurar contas recorrentes\n' +
                         '• **Categorias:** Personalizar categorias de gastos\n' +
                         '• **Metas:** Definir metas financeiras\n' +
                         '• **Alertas:** Configurar notificações\n\n' +
                         'Use os botões na barra superior para acessar essas funcionalidades.'
            }
        };
    }

    handleAddDebt(text, user, accounts, fixedBills, context) {
        context.sessionData.lastIntent = 'ADD_DEBT';
        
        const entityExtractor = new AdvancedEntityExtractor();
        const amount = entityExtractor.extractMoney(text);
        
        // Extrair nome da pessoa/estabelecimento
        const debtPatterns = [
            /(?:estou|to)\s+devendo\s+(?:a|para)\s+(.+?)\s+(?:R?\$?\s*)?(\d+[.,]?\d*)/i,
            /devo\s+(?:a|para)\s+(.+?)\s+(?:R?\$?\s*)?(\d+[.,]?\d*)/i,
            /(?:peguei|pedi)\s+emprestado\s+(?:R?\$?\s*)?(\d+[.,]?\d*)\s+(?:de|com)\s+(.+)/i,
            /(?:R?\$?\s*)?(\d+[.,]?\d*)\s+(?:de|com)\s+(.+?)\s+(?:emprestado|emprestou)/i
        ];
        
        let debtorName = null;
        let extractedAmount = amount;
        
        for (let pattern of debtPatterns) {
            const match = text.match(pattern);
            if (match) {
                if (match[1] && match[2]) {
                    // Padrão: "devo a [nome] [valor]"
                    debtorName = match[1].trim();
                    extractedAmount = extractedAmount || parseFloat(match[2].replace(',', '.'));
                } else if (match[1] && match[2]) {
                    // Padrão: "peguei emprestado [valor] de [nome]"
                    extractedAmount = extractedAmount || parseFloat(match[1].replace(',', '.'));
                    debtorName = match[2].trim();
                }
                break;
            }
        }
        
        if (!extractedAmount || extractedAmount <= 0) {
            return {
                type: 'clarification',
                payload: {
                    message: '💰 Quanto você deve?\n\n' +
                             '**Exemplos:**\n' +
                             '• "Estou devendo R$ 50 para a farmácia"\n' +
                             '• "Devo 100 reais para Maria"\n' +
                             '• "Peguei emprestado R$ 200 do João"'
                }
            };
        }
        
        if (!debtorName || debtorName.length < 2) {
            return {
                type: 'clarification',
                payload: {
                    message: '👤 Para quem você deve?\n\n' +
                             '**Exemplos:**\n' +
                             '• "Estou devendo R$ 50 para a farmácia"\n' +
                             '• "Devo 100 reais para Maria"\n' +
                             '• "Peguei emprestado R$ 200 do João"'
                }
            };
        }
        
        // Limpar nome do devedor
        debtorName = debtorName.replace(/^(a|para|de|com)\s+/i, '').trim();
        
        return {
            type: 'action',
            payload: {
                action: 'ADD_DEBT',
                data: {
                    amount: extractedAmount,
                    debtorName: debtorName,
                    description: `Dívida com ${debtorName}`,
                    type: 'debt',
                    category: 'dividas_emprestimos',
                    date: new Date(),
                    isActive: true
                }
            }
        };
    }

    handleDailyExpenses(text, user, accounts, fixedBills, context) {
        context.sessionData.lastIntent = 'QUERY_DAILY_EXPENSES';
        
        const textLower = text.toLowerCase();
        let targetDate = new Date();
        
        // Detectar se é hoje ou ontem
        if (textLower.includes('ontem')) {
            targetDate.setDate(targetDate.getDate() - 1);
        }
        
        return {
            type: 'action',
            payload: {
                action: 'QUERY_DAILY_EXPENSES',
                data: {
                    date: targetDate,
                    period: 'day',
                    queryType: 'expenses'
                }
            }
        };
    }

    handleDailyIncome(text, user, accounts, fixedBills, context) {
        context.sessionData.lastIntent = 'QUERY_DAILY_INCOME';
        
        const textLower = text.toLowerCase();
        let targetDate = new Date();
        
        // Detectar se é hoje ou ontem
        if (textLower.includes('ontem')) {
            targetDate.setDate(targetDate.getDate() - 1);
        }
        
        return {
            type: 'action',
            payload: {
                action: 'QUERY_DAILY_INCOME',
                data: {
                    date: targetDate,
                    period: 'day',
                    queryType: 'income'
                }
            }
        };
    }

    handleDailyTransfers(text, user, accounts, fixedBills, context) {
        context.sessionData.lastIntent = 'QUERY_DAILY_TRANSFERS';
        
        const textLower = text.toLowerCase();
        let targetDate = new Date();
        
        // Detectar se é hoje ou ontem
        if (textLower.includes('ontem')) {
            targetDate.setDate(targetDate.getDate() - 1);
        }
        
        return {
            type: 'action',
            payload: {
                action: 'QUERY_DAILY_TRANSFERS',
                data: {
                    date: targetDate,
                    period: 'day',
                    queryType: 'transfers'
                }
            }
        };
    }

    handleAnalytics(text, user, accounts, fixedBills, context) {
        context.sessionData.lastIntent = 'ANALYTICS';
        
        return {
            type: 'action',
            payload: {
                action: 'ANALYTICS',
                data: {
                    type: 'spending_analysis',
                    period: 'month'
                }
            }
        };
    }

    // Handler para análise comparativa mensal
    handleMonthlyComparison(text, user, accounts, fixedBills, context) {
        context.sessionData.lastIntent = 'MONTHLY_COMPARISON';
        
        return {
            type: 'action',
            payload: {
                action: 'MONTHLY_COMPARISON',
                data: {
                    type: 'monthly_comparison',
                    userId: user.uid
                }
            }
        };
    }

    // Handler para sugestões de economia
    handleSavingsSuggestions(text, user, accounts, fixedBills, context) {
        context.sessionData.lastIntent = 'SAVINGS_SUGGESTIONS';
        
        return {
            type: 'action',
            payload: {
                action: 'SAVINGS_SUGGESTIONS',
                data: {
                    type: 'savings_suggestions',
                    userId: user.uid
                }
            }
        };
    }

    handleUnknown(text, user, accounts, fixedBills, context) {
        context.sessionData.lastIntent = 'UNKNOWN';
        
        return {
            type: 'response',
            payload: {
                message: '🤔 Não entendi exatamente o que você quer fazer. Pode reformular sua mensagem?\n\n' +
                         '**Exemplos de comandos:**\n' +
                         '• "Gastei R$ 50 no mercado"\n' +
                         '• "Paguei o aluguel"\n' +
                         '• "Paguei 100 reais do aluguel" (pagamento parcial)\n' +
                         '• "Transferi R$ 100 do Nubank para o Itaú"\n' +
                         '• "Qual meu saldo?"\n' +
                         '• "Quais contas não paguei ainda?"\n' +
                         '• "Quero um relatório"\n' +
                         '• "Análise dos meus gastos"\n' +
                         '• "Estou devendo R$ 50 para a farmácia"'
            }
        };
    }
}

// ========================================
// PROCESSADOR DE PERGUNTAS PENDENTES
// ========================================

class PendingQuestionProcessor {
    constructor() {
        this.entityExtractor = new AdvancedEntityExtractor();
    }

    processPendingQuestion(text, pendingQuestion, user, accounts, fixedBills, context) {
        // Validação robusta de entrada
        if (!text || typeof text !== 'string') {
            console.error('processPendingQuestion: text inválido:', text);
            return {
                type: 'response',
                payload: {
                    message: '❌ Resposta inválida. Por favor, digite uma resposta válida.'
                }
            };
        }
        
        if (!pendingQuestion || typeof pendingQuestion !== 'object') {
            console.error('processPendingQuestion: pendingQuestion inválido:', pendingQuestion);
            context.resolvePendingQuestion();
            return {
                type: 'response',
                payload: {
                    message: '❌ Erro interno. Pode tentar novamente?'
                }
            };
        }
        
        if (!user) {
            console.error('processPendingQuestion: user não autenticado');
            return {
                type: 'response',
                payload: {
                    message: '❌ Usuário não autenticado. Faça login novamente.'
                }
            };
        }
        
        // Normalizar arrays
        if (!accounts || !Array.isArray(accounts)) {
            console.warn('processPendingQuestion: accounts inválido, usando array vazio');
            accounts = [];
        }
        
        if (!fixedBills || !Array.isArray(fixedBills)) {
            console.warn('processPendingQuestion: fixedBills inválido, usando array vazio');
            fixedBills = [];
        }
        
        const { type, data } = pendingQuestion;
        
        try {
            switch (type) {
                case 'SELECT_ACCOUNT':
                    return this.handleSelectAccount(text, data, accounts, context);
                    
                case 'SELECT_FROM_ACCOUNT':
                    return this.handleSelectFromAccount(text, data, accounts, context);
                    
                case 'SELECT_TO_ACCOUNT':
                    return this.handleSelectToAccount(text, data, accounts, context);
                    
                case 'SELECT_ACCOUNT_FOR_BILL':
                    return this.handleSelectAccountForBill(text, data, accounts, context);
                    
                case 'AMOUNT_CLARIFICATION':
                    return this.handleAmountClarification(text, data, context);
                    
                case 'DESCRIPTION_CLARIFICATION':
                    return this.handleDescriptionClarification(text, data, accounts, context);
                    
                case 'TRANSFER_ACCOUNTS':
                    return this.handleTransferAccounts(text, data, accounts, context);
                    
                default:
                    console.warn('processPendingQuestion: tipo desconhecido:', type);
                    context.resolvePendingQuestion();
                    return {
                        type: 'response',
                        payload: {
                            message: '❌ Tipo de pergunta não reconhecido. Pode tentar novamente?'
                        }
                    };
            }
        } catch (error) {
            console.error('Erro ao processar pergunta pendente:', error);
            context.resolvePendingQuestion();
            return {
                type: 'response',
                payload: {
                    message: '❌ Erro ao processar sua resposta. Pode tentar novamente?\n\n' +
                             '**Exemplos:**\n' +
                             '• "nubank" (para escolher conta)\n' +
                             '• "mercado" (para descrição)\n' +
                             '• "50" (para valor)'
                }
            };
        }
    }

    handleSelectAccount(text, data, accounts, context) {
        const account = this.entityExtractor.extractAccount(text, accounts);
        if (account) {
            context.resolvePendingQuestion();
            return {
                type: 'action',
                payload: {
                    action: 'ADD_TRANSACTION',
                    data: {
                        accountId: account.id || '',
                        amount: data.amount || context.contextData.amount || 0,
                        description: data.description || '',
                        type: data.type || 'expense',
                        category: data.isTransferToPerson ? 'transferencia_pessoal' : (data.category || 'outros'),
                        date: data.date || new Date() // <-- Usar data salva ou data atual como fallback
                    }
                }
            };
        } else {
            // Verificar se há contas com saldo suficiente
            const accountsWithBalance = accounts.filter(acc => (acc.balance || 0) >= (data.amount || 0));
            
            if (accountsWithBalance.length === 0) {
                return {
                    type: 'response',
                    payload: {
                        message: `❌ **Saldo insuficiente!**\n\n` +
                                 `💰 **Valor necessário:** R$ ${(data.amount || 0).toFixed(2)}\n\n` +
                                 `**Suas contas:**\n${accounts.map(acc => `• ${acc.name}: R$ ${(acc.balance || 0).toFixed(2)}`).join('\n')}\n\n` +
                                 `💡 **Soluções:**\n` +
                                 `• Adicione dinheiro em uma conta\n` +
                                 `• Use uma conta diferente`
                    }
                };
            }
            
            return {
                type: 'clarification',
                payload: {
                    message: '❌ Não consegui identificar a conta. Pode especificar qual conta você quer usar?\n\n**Escolha uma conta:**',
                    buttons: accountsWithBalance.map(acc => ({
                        text: `${acc.name} - R$ ${(acc.balance || 0).toFixed(2)}`,
                        value: acc.name,
                        disabled: false,
                        style: 'success'
                    }))
                }
            };
        }
    }

    handleSelectFromAccount(text, data, accounts, context) {
        const fromAccount = this.entityExtractor.extractAccount(text, accounts);
        if (fromAccount) {
            context.addPendingQuestion('SELECT_TO_ACCOUNT', {
                action: 'PERFORM_TRANSFER',
                amount: data.amount || 0,
                fromAccountId: fromAccount.id || ''
            }, 2);
            
            const accountOptions = accounts.map(acc => acc.name).join(', ');
            return {
                type: 'clarification',
                payload: {
                    message: `📥 Para qual conta você quer transferir R$ ${(data.amount || 0).toFixed(2)}? 🔄\n\n**Escolha uma conta:**`,
                    buttons: accounts.map(acc => ({
                        text: `${acc.name} - R$ ${(acc.balance || 0).toFixed(2)}`,
                        value: acc.name,
                        disabled: false,
                        style: 'primary'
                    }))
                }
            };
        } else {
            return {
                type: 'clarification',
                payload: {
                    message: '❌ Não consegui identificar a conta de origem. Pode especificar qual conta você quer usar?\n\n' +
                             '**Suas contas:**\n' + accounts.map(acc => `• ${acc.name}`).join('\n') + '\n\n**Exemplo:** "nubank"'
                }
            };
        }
    }

    handleSelectToAccount(text, data, accounts, context) {
        const toAccount = this.entityExtractor.extractAccount(text, accounts);
        if (toAccount) {
            context.resolvePendingQuestion();
            return {
                type: 'action',
                payload: {
                    action: 'PERFORM_TRANSFER',
                    data: {
                        fromAccountId: data.fromAccountId || '',
                        toAccountId: toAccount.id || '',
                        amount: data.amount || 0
                    }
                }
            };
        } else {
            return {
                type: 'clarification',
                payload: {
                    message: '❌ Não consegui identificar a conta de destino. Pode especificar qual conta você quer usar?\n\n**Escolha uma conta:**',
                    buttons: accounts.map(acc => ({
                        text: `${acc.name} - R$ ${(acc.balance || 0).toFixed(2)}`,
                        value: acc.name,
                        disabled: false,
                        style: 'primary'
                    }))
                }
            };
        }
    }

    handleSelectAccountForBill(text, data, accounts, context) {
        const billAccount = this.entityExtractor.extractAccount(text, accounts);
        if (billAccount) {
            context.resolvePendingQuestion();
            
            const isPartialPayment = data.isPartialPayment || false;
            const isRemainingPayment = data.isRemainingPayment || false;
            const remainingAmount = data.remainingAmount || 0;
            
            return {
                type: 'action',
                payload: {
                    action: 'PAY_FIXED_BILL_CHAT',
                    data: {
                        billId: data.billId,
                        paymentAmount: data.amount || 0,
                        accountId: billAccount.id || '',
                        isFullPayment: !isPartialPayment && !isRemainingPayment,
                        isRemainingPayment: isRemainingPayment,
                        remainingAmount: remainingAmount,
                        billDescription: data.description
                    }
                }
            };
        } else {
            return {
                type: 'clarification',
                payload: {
                    message: '❌ Não consegui identificar a conta. Pode especificar qual conta você usou para pagar?\n\n**Escolha uma conta:**',
                    buttons: accounts
                        .filter(acc => (acc.balance || 0) >= (data.amount || 0)) // Apenas contas com saldo suficiente
                        .map(acc => ({
                            text: `${acc.name} - R$ ${(acc.balance || 0).toFixed(2)}`,
                            value: acc.name,
                            disabled: false,
                            style: 'success'
                        }))
                }
            };
        }
    }

    handleAmountClarification(text, data, context) {
        const amount = this.entityExtractor.extractMoney(text);
        if (amount && amount > 0) {
            context.contextData.amount = amount;
            
            if (data.action === 'PERFORM_TRANSFER') {
                context.addPendingQuestion('TRANSFER_ACCOUNTS', {
                    action: 'PERFORM_TRANSFER',
                    amount: amount || 0
                }, 2);
                
                return {
                    type: 'clarification',
                    payload: {
                        message: `🔄 De qual conta para qual conta você quer transferir R$ ${(amount || 0).toFixed(2)}?`
                    }
                };
            } else {
                context.addPendingQuestion('DESCRIPTION_CLARIFICATION', {
                    action: data.action,
                    amount: amount || 0,
                    type: data.type || 'expense',
                    isTransferToPerson: data.isTransferToPerson,
                    category: data.category
                }, 2);
                
                return {
                    type: 'clarification',
                    payload: {
                        message: data.type === 'expense' ? 
                            '📝 Em quê você gastou esse dinheiro?' :
                            '📝 De onde veio esse dinheiro?'
                    }
                };
            }
        } else {
            return {
                type: 'clarification',
                payload: {
                    message: '❌ Não consegui entender o valor. Pode dizer quanto?\n\n' +
                             '**Exemplos:**\n' +
                             '• "R$ 50"\n' +
                             '• "cinquenta reais"\n' +
                             '• "50 contos"\n' +
                             '• "mil reais"\n' +
                             '• "10" (apenas o número)'
                }
            };
        }
    }

    handleDescriptionClarification(text, data, accounts, context) {
        const description = text.trim();
        if (description && description.length >= 2) {
            const amount = context.contextData.amount || data.amount || 0;
            context.resolvePendingQuestion();
            
            if (!data.accountId) {
                context.addPendingQuestion('SELECT_ACCOUNT', {
                    action: data.action,
                    amount: amount || 0,
                    description: description || '',
                    type: data.type || 'expense',
                    isTransferToPerson: data.isTransferToPerson,
                    category: data.category
                }, 2);
                
                const accountOptions = accounts.map(acc => acc.name).join(', ');
                return {
                    type: 'clarification',
                    payload: {
                        message: data.type === 'expense' ?
                            `🏦 De qual conta você quer debitar R$ ${(amount || 0).toFixed(2)}? 📤\n\nSuas contas: ${accountOptions}` :
                            `🏦 Em qual conta você quer creditar R$ ${(amount || 0).toFixed(2)}? 📥\n\nSuas contas: ${accountOptions}`
                    }
                };
            }
            
                                    return {
                type: 'action',
                payload: {
                    action: 'ADD_TRANSACTION',
                    data: {
                        accountId: data.accountId || '',
                        amount: amount || 0,
                        description: description || '',
                        type: data.type || 'expense',
                        category: data.isTransferToPerson ? 'transferencia_pessoal' : (data.category || 'outros'),
                        date: new Date()
                    }
                }
            };
        } else {
            return {
                type: 'clarification',
                payload: {
                    message: '❌ Pode me dizer em quê você gastou esse dinheiro?\n\n' +
                             '**Exemplos:**\n' +
                             '• "No mercado"\n' +
                             '• "Comida"\n' +
                             '• "Uber"\n' +
                             '• "Restaurante"\n\n**Exemplo:** "mercado"'
                }
            };
        }
    }

    handleTransferAccounts(text, data, accounts, context) {
        // Tentar extrair ambas as contas da mensagem
        const accountNames = accounts.map(acc => acc.name.toLowerCase());
        const textLower = text.toLowerCase();
        
        let fromAccount = null;
        let toAccount = null;
        
        // Procurar por padrões como "de X para Y"
        const transferPattern = /(?:de|do|da)\s+(.+?)\s+(?:para|pro|pra)\s+(.+)/i;
        const match = text.match(transferPattern);
        
        if (match) {
            const fromText = match[1].trim();
            const toText = match[2].trim();
            
            fromAccount = this.entityExtractor.extractAccount(fromText, accounts);
            toAccount = this.entityExtractor.extractAccount(toText, accounts);
        } else {
            // Se não encontrou padrão, tentar extrair contas individualmente
            for (let account of accounts) {
                if (textLower.includes(account.name.toLowerCase())) {
                    if (!fromAccount) {
                        fromAccount = account;
                    } else if (!toAccount) {
                        toAccount = account;
                        break;
                    }
                }
            }
        }
        
        if (fromAccount && toAccount && fromAccount.id !== toAccount.id) {
            context.resolvePendingQuestion();
            return {
                type: 'action',
                payload: {
                    action: 'PERFORM_TRANSFER',
                    data: {
                        fromAccountId: fromAccount.id || '',
                        toAccountId: toAccount.id || '',
                        amount: data.amount || 0
                    }
                }
            };
        } else {
            const accountOptions = accounts.map(acc => acc.name).join(', ');
            return {
                type: 'clarification',
                payload: {
                    message: `🔄 De qual conta para qual conta você quer transferir R$ ${(data.amount || 0).toFixed(2)}? 📤➡️📥\n\n` +
                             `**Suas contas:**\n${accounts.map(acc => `• ${acc.name}`).join('\n')}\n\n` +
                             `**Exemplo:** "de nubank para itau" ou "nubank itau"`
                }
            };
        }
    }
}

// ========================================
// FUNÇÃO PRINCIPAL DE PROCESSAMENTO
// ========================================

export function processMessageAdvanced(text, user, accounts, fixedBills, context) {
    // Validação robusta de entrada
    if (!text || typeof text !== 'string') {
        console.error('processMessageAdvanced: text inválido:', text);
        return {
            type: 'response',
            payload: {
                message: '❌ Mensagem inválida. Por favor, digite uma mensagem válida.'
            }
        };
    }
    
    if (!user) {
        console.error('processMessageAdvanced: user não autenticado');
        return {
            type: 'response',
            payload: {
                message: '❌ Usuário não autenticado. Faça login novamente.'
            }
        };
    }
    
    if (!context || typeof context !== 'object') {
        console.error('processMessageAdvanced: context inválido:', context);
        return {
            type: 'response',
            payload: {
                message: '❌ Erro interno do sistema. Recarregue a página.'
            }
        };
    }
    
    // Normalizar arrays
    if (!accounts || !Array.isArray(accounts)) {
        console.warn('processMessageAdvanced: accounts inválido, usando array vazio');
        accounts = [];
    }
    
    if (!fixedBills || !Array.isArray(fixedBills)) {
        console.warn('processMessageAdvanced: fixedBills inválido, usando array vazio');
        fixedBills = [];
    }

    // Verificar se é um comando de abortar
    if (context.isAbortCommand(text)) {
        context.clear();
        return {
            type: 'response',
            payload: {
                message: '✅ Ok, vamos fazer outra coisa. Como posso ajudá-lo?'
            }
        };
    }

    // Verificar se é um comando de confirmação
    if (context.isConfirmationCommand(text)) {
        const pendingQuestion = context.getNextPendingQuestion();
        if (pendingQuestion) {
            // Confirmar a ação pendente
            context.resolvePendingQuestion();
            return {
                type: 'response',
                payload: {
                    message: '✅ Confirmado! Ação executada com sucesso.'
                }
            };
        }
    }

    // Verificar se há uma pergunta pendente
    const pendingQuestion = context.getNextPendingQuestion();
    if (pendingQuestion) {
        try {
            const processor = new PendingQuestionProcessor();
            return processor.processPendingQuestion(text, pendingQuestion, user, accounts, fixedBills, context);
        } catch (error) {
            console.error('Erro ao processar pergunta pendente:', error);
            context.resolvePendingQuestion(); // Limpar pergunta problemática
            return {
                type: 'response',
                payload: {
                    message: '❌ Erro ao processar sua resposta. Pode tentar novamente?'
                }
            };
        }
    }

    // Analisar contexto da mensagem
    let contextAnalysis, sentiment;
    try {
        contextAnalysis = context.analyzeContext(text);
        sentiment = context.analyzeSentiment(text);
    } catch (error) {
        console.error('Erro ao analisar contexto:', error);
        contextAnalysis = { isQuestion: false, isCommand: false, isStatement: false, userMood: 'neutral' };
        sentiment = 'neutral';
    }

    // Adicionar contas fixas ao contexto para boost de classificação
    context.fixedBills = fixedBills;

    // Classificar a intenção
    let classification;
    try {
        const intentClassifier = new AdvancedIntentClassifier();
        classification = intentClassifier.classify(text, context);
        
        
        // Debug específico para transferências
        
    } catch (error) {
        console.error('Erro ao classificar intenção:', error);
        classification = {
            intent: 'UNKNOWN',
            confidence: 0,
            handler: (text, user, accounts, fixedBills, context) => ({
                type: 'response',
                payload: {
                    message: '❌ Erro interno ao processar sua mensagem. Tente novamente.'
                }
            })
        };
    }

    // Adicionar à história da conversa
    try {
        context.addToHistory(text, classification.intent, classification.confidence, null);
    } catch (error) {
        console.error('Erro ao adicionar à história:', error);
    }

    // Executar o handler da intenção
    if (classification.handler) {
        try {
            const result = classification.handler(text, user, accounts, fixedBills, context);
            
            // Validar resultado
            if (!result || typeof result !== 'object') {
                throw new Error('Handler retornou resultado inválido');
            }
            
            if (!result.type || !result.payload) {
                throw new Error('Resultado do handler não tem estrutura válida');
            }
            
            // Adicionar resposta à história
            if (result.payload && result.payload.message) {
                try {
                    context.addToHistory(text, classification.intent, classification.confidence, result.payload.message);
                } catch (error) {
                    console.error('Erro ao adicionar resposta à história:', error);
                }
            }
            
            return result;
        } catch (error) {
            console.error('Erro ao executar handler:', error);
            return {
                type: 'response',
                payload: {
                    message: '❌ Erro interno do sistema. Tente reformular sua mensagem.'
                }
            };
        }
    }

    return {
        type: 'response',
        payload: {
            message: '🤔 Desculpe, não consegui entender o que você quer fazer. Pode reformular sua mensagem?\n\n' +
                     '**Exemplos de comandos:**\n' +
                     '• "Gastei R$ 50 no mercado"\n' +
                     '• "Paguei o aluguel"\n' +
                     '• "Paguei 100 reais do aluguel" (pagamento parcial)\n' +
                     '• "Transferi R$ 100 do Nubank para o Itaú"\n' +
                     '• "Qual meu saldo?"\n' +
                     '• "Quais contas não paguei ainda?"\n' +
                     '• "Quero um relatório"\n' +
                     '• "Análise dos meus gastos"\n' +
                     '• "Estou devendo R$ 50 para a farmácia"'
        }
    };
}

// Exportar classes
export { AdvancedContextManager, AdvancedEntityExtractor, AdvancedIntentClassifier, PendingQuestionProcessor };
