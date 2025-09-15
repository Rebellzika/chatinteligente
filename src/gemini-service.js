// Serviço de Integração com Google Gemini 2.5 Flash Preview
// Substitui o sistema NLU avançado por IA mais poderosa

class GeminiService {
    constructor() {
        this.apiKey = 'AIzaSyA6Ffl4D3Ju6HZ-Ly6KYZaBfdJlJ0H0g6M';
        this.apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';
        this.context = {
            userAccounts: [],
            fixedBills: [],
            recentTransactions: [],
            currentUser: null
        };
    }

    // Atualiza o contexto com dados do usuário
    updateContext(userData) {
        this.context = {
            ...this.context,
            ...userData
        };
    }

    // Processa mensagem do usuário usando Gemini
    async processMessage(message, userContext = {}) {
        try {
            // Atualiza contexto com dados mais recentes
            this.updateContext(userContext);

            // Monta o prompt estruturado para o Gemini
            const prompt = this.buildPrompt(message);
            
            // Chama a API do Gemini
            const response = await this.callGeminiAPI(prompt);
            
            // Processa a resposta e extrai a ação
            const action = this.parseGeminiResponse(response, message);
            
            return action;
        } catch (error) {
            console.error('Erro ao processar mensagem com Gemini:', error);
            return this.getFallbackResponse(message);
        }
    }

    // Constrói prompt estruturado para o Gemini
    buildPrompt(userMessage) {
        const accountsInfo = this.context.userAccounts.map(acc => 
            `- ${acc.name}: R$ ${acc.balance.toFixed(2)}`
        ).join('\n');

        const fixedBillsInfo = this.context.fixedBills.map(bill => 
            `- ${bill.name}: R$ ${bill.amount.toFixed(2)} (vencimento dia ${bill.dueDay})`
        ).join('\n');

        // Buscar transações recentes para contexto
        const recentTransactions = this.context.recentTransactions || [];
        const recentTransactionsInfo = recentTransactions.slice(0, 5).map(t => 
            `- ${t.type === 'expense' ? 'Despesa' : t.type === 'income' ? 'Receita' : 'Transferência'}: R$ ${t.amount.toFixed(2)} - ${t.description} (${new Date(t.date).toLocaleDateString('pt-BR')})`
        ).join('\n');

        return `Você é o Dinah, um assistente financeiro inteligente que funciona DENTRO de um aplicativo de controle financeiro pessoal.

⚠️ CONTEXTO CRÍTICO: Você está funcionando dentro de um programa/aplicativo financeiro. TODAS as interações do usuário são referentes a este programa específico. NUNCA confunda com bancos reais ou sistemas externos.

📊 DADOS REAIS DO USUÁRIO (NÃO INVENTE NADA):
Contas disponíveis no programa:
${accountsInfo || 'Nenhuma conta cadastrada'}

Contas fixas cadastradas:
${fixedBillsInfo || 'Nenhuma conta fixa cadastrada'}

Transações recentes:
${recentTransactionsInfo || 'Nenhuma transação recente'}

Mensagem do usuário: "${userMessage}"

🔒 REGRAS OBRIGATÓRIAS:
1. TODAS as operações são dentro deste programa financeiro
2. NUNCA invente dados que não existem
3. SEMPRE use apenas as contas listadas acima
4. Para consultas históricas, diga que vai buscar no banco de dados
5. Se não souber algo, pergunte ao usuário ou diga que vai consultar os dados
6. NUNCA confunda com bancos reais (Nubank, Itaú, etc.) - são apenas nomes de contas no programa

RESPONDA APENAS COM JSON no seguinte formato:
{
    "intent": "INTENÇÃO_IDENTIFICADA",
    "amount": valor_numerico_ou_null,
    "description": "descrição_clara_da_transação",
    "fromAccount": "nome_da_conta_origem_ou_null",
    "toAccount": "nome_da_conta_destino_ou_null", 
    "fixedBillName": "nome_da_conta_fixa_ou_null",
    "category": "categoria_apropriada_ou_null",
    "confidence": 0.0_a_1.0,
    "response": "resposta_amigável_e_clara_para_o_usuário",
    "needsDatabaseQuery": true_ou_false,
    "queryType": "tipo_de_consulta_ou_null"
}

EXEMPLOS ESPECÍFICOS:

Usuário: "Oi Dinah"
{
    "intent": "GREETING",
    "amount": null,
    "description": null,
    "fromAccount": null,
    "toAccount": null,
    "fixedBillName": null,
    "category": null,
    "confidence": 0.99,
    "response": "Olá! Sou o Dinah, seu assistente financeiro. Como posso ajudá-lo hoje?",
    "needsDatabaseQuery": false,
    "queryType": null
}

Usuário: "Gastei 50 reais no mercado"
{
    "intent": "ADD_EXPENSE",
    "amount": 50,
    "description": "Mercado",
    "fromAccount": null,
    "toAccount": null,
    "fixedBillName": null,
    "category": "alimentação",
    "confidence": 0.95,
    "response": "Registrei sua despesa de R$ 50,00 no mercado. De qual conta você quer debitar?",
    "needsDatabaseQuery": false,
    "queryType": null
}

Usuário: "Quanto gastei ontem?"
{
    "intent": "QUERY_TRANSACTIONS",
    "amount": null,
    "description": null,
    "fromAccount": null,
    "toAccount": null,
    "fixedBillName": null,
    "category": null,
    "confidence": 0.98,
    "response": "Vou consultar seus gastos de ontem no banco de dados...",
    "needsDatabaseQuery": true,
    "queryType": "expenses_by_date"
}

Usuário: "Transferi 100 reais do Nubank para Itaú"
{
    "intent": "PERFORM_TRANSFER",
    "amount": 100,
    "description": "Transferência entre contas",
    "fromAccount": "Nubank",
    "toAccount": "Itaú", 
    "fixedBillName": null,
    "category": null,
    "confidence": 0.98,
    "response": "Perfeito! Vou transferir R$ 100,00 do Nubank para o Itaú.",
    "needsDatabaseQuery": false,
    "queryType": null
}

Usuário: "tenho alguma conta fixa que não paguei?"
{
    "intent": "QUERY_FIXED_BILLS",
    "amount": null,
    "description": null,
    "fromAccount": null,
    "toAccount": null,
    "fixedBillName": null,
    "category": null,
    "confidence": 0.95,
    "response": "Vou consultar suas contas fixas no banco de dados...",
    "needsDatabaseQuery": true,
    "queryType": "unpaid_bills"
}

Responda APENAS com o JSON, sem texto adicional.`;
    }

    // Chama a API do Gemini
    async callGeminiAPI(prompt) {
        try {
            const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.1,
                        topK: 1,
                        topP: 0.8,
                        maxOutputTokens: 1024,
                    }
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`Erro na API do Gemini: ${response.status} - ${errorData.error?.message || response.statusText}`);
            }

            const data = await response.json();
            
            if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
                throw new Error('Resposta inválida da API do Gemini');
            }

            return data.candidates[0].content.parts[0].text;
        } catch (error) {
            console.error('Erro ao chamar API do Gemini:', error);
            
            // Retry logic para erros temporários
            if (error.message.includes('500') || error.message.includes('503') || error.message.includes('timeout')) {
                console.log('Tentando novamente em 2 segundos...');
                await new Promise(resolve => setTimeout(resolve, 2000));
                return this.callGeminiAPI(prompt);
            }
            
            throw error;
        }
    }

    // Processa resposta do Gemini e converte para formato esperado
    parseGeminiResponse(geminiResponse, originalMessage = '') {
        try {
            // Limpa a resposta e extrai apenas o JSON
            const cleanResponse = geminiResponse.trim();
            const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
            
            if (!jsonMatch) {
                throw new Error('Resposta do Gemini não contém JSON válido');
            }

            const parsedResponse = JSON.parse(jsonMatch[0]);
            
            // Converte para formato esperado pelo sistema
            return {
                intent: parsedResponse.intent,
                entities: {
                    amount: parsedResponse.amount,
                    description: parsedResponse.description,
                    fromAccount: parsedResponse.fromAccount,
                    toAccount: parsedResponse.toAccount,
                    fixedBillName: parsedResponse.fixedBillName,
                    category: parsedResponse.category
                },
                confidence: parsedResponse.confidence || 0.8,
                response: parsedResponse.response,
                needsDatabaseQuery: parsedResponse.needsDatabaseQuery || false,
                queryType: parsedResponse.queryType || null,
                rawResponse: geminiResponse
            };
        } catch (error) {
            console.error('Erro ao processar resposta do Gemini:', error);
            return this.getFallbackResponse(originalMessage);
        }
    }

    // Resposta de fallback em caso de erro
    getFallbackResponse(originalMessage = '') {
        // Tentativa de análise básica local como fallback
        const fallbackResult = this.analyzeMessageLocally(originalMessage);
        
        return {
            intent: fallbackResult.intent,
            entities: fallbackResult.entities,
            confidence: 0.3, // Baixa confiança para fallback
            response: fallbackResult.response || 'Desculpe, não consegui processar sua mensagem. Pode tentar novamente de forma mais específica?',
            needsDatabaseQuery: false,
            queryType: null,
            rawResponse: 'Fallback local'
        };
    }

    // Análise básica local como fallback quando a API falha
    analyzeMessageLocally(message) {
        const lowerMessage = message.toLowerCase();
        
        // Detectar despesas
        if (lowerMessage.includes('gastei') || lowerMessage.includes('paguei') || lowerMessage.includes('comprei')) {
            const amountMatch = message.match(/(\d+(?:[.,]\d+)?)/);
            return {
                intent: 'ADD_EXPENSE',
                entities: {
                    amount: amountMatch ? parseFloat(amountMatch[1].replace(',', '.')) : null,
                    description: 'Despesa',
                    fromAccount: null,
                    toAccount: null,
                    fixedBillName: null,
                    category: 'outros'
                },
                response: amountMatch ? 
                    `Registrei sua despesa de R$ ${amountMatch[1]}. De qual conta você quer debitar?` :
                    'Por favor, informe o valor da despesa.'
            };
        }
        
        // Detectar receitas
        if (lowerMessage.includes('recebi') || lowerMessage.includes('ganhei') || lowerMessage.includes('entrou')) {
            const amountMatch = message.match(/(\d+(?:[.,]\d+)?)/);
            return {
                intent: 'ADD_INCOME',
                entities: {
                    amount: amountMatch ? parseFloat(amountMatch[1].replace(',', '.')) : null,
                    description: 'Receita',
                    fromAccount: null,
                    toAccount: null,
                    fixedBillName: null,
                    category: 'outros'
                },
                response: amountMatch ? 
                    `Registrei sua receita de R$ ${amountMatch[1]}. Em qual conta você quer creditar?` :
                    'Por favor, informe o valor da receita.'
            };
        }
        
        // Detectar consulta de saldo
        if (lowerMessage.includes('saldo') || lowerMessage.includes('quanto tenho')) {
            return {
                intent: 'QUERY_BALANCE',
                entities: {
                    amount: null,
                    description: null,
                    fromAccount: null,
                    toAccount: null,
                    fixedBillName: null,
                    category: null
                },
                response: 'Vou consultar seus saldos...'
            };
        }
        
        // Detectar transferências
        if (lowerMessage.includes('transferi') || lowerMessage.includes('movi')) {
            const amountMatch = message.match(/(\d+(?:[.,]\d+)?)/);
            return {
                intent: 'PERFORM_TRANSFER',
                entities: {
                    amount: amountMatch ? parseFloat(amountMatch[1].replace(',', '.')) : null,
                    description: 'Transferência',
                    fromAccount: null,
                    toAccount: null,
                    fixedBillName: null,
                    category: null
                },
                response: amountMatch ? 
                    `Registrei sua transferência de R$ ${amountMatch[1]}. Especifique as contas de origem e destino.` :
                    'Por favor, informe o valor da transferência.'
            };
        }
        
        // Fallback genérico
        return {
            intent: 'GREETING',
            entities: {
                amount: null,
                description: null,
                fromAccount: null,
                toAccount: null,
                fixedBillName: null,
                category: null
            },
            response: 'Olá! Como posso ajudá-lo com suas finanças hoje?'
        };
    }

    // Método para testar a conexão com a API
    async testConnection() {
        try {
            const testResponse = await this.callGeminiAPI('Responda apenas: "Conexão OK"');
            return testResponse.includes('Conexão OK');
        } catch (error) {
            console.error('Erro no teste de conexão:', error);
            return false;
        }
    }
}

// Instância global do serviço
const geminiService = new GeminiService();

// Função principal para processar mensagens (substitui processMessageAdvanced)
export async function processMessageWithGemini(message, userContext = {}) {
    return await geminiService.processMessage(message, userContext);
}

// Função para atualizar contexto do usuário
export function updateGeminiContext(userData) {
    geminiService.updateContext(userData);
}

// Função para testar conexão
export async function testGeminiConnection() {
    return await geminiService.testConnection();
}

export default geminiService;
