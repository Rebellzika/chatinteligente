// 🎨 CONFIGURAÇÃO DE AVATARES BASE64 DO DINAH - COMPLETO
// ========================================================

// 📁 CONFIGURAÇÃO DAS IMAGENS EM BASE64
const AVATAR_BASE64 = {
    // 🖼️ IMAGEM PRINCIPAL (Tela de Login)
    main: {
        src: "data:image/png;base64,SUA_IMAGEM_BASE64_AQUI",  // ← TROQUE AQUI!
        alt: "Dinah Avatar",
        size: "w-20 h-20"
    },
    
    // 🖼️ IMAGEM DO HEADER
    header: {
        src: "data:image/png;base64,SUA_IMAGEM_BASE64_AQUI",  // ← TROQUE AQUI!
        alt: "Dinah",
        size: "w-10 h-10"
    },
    
    // 🖼️ IMAGEM DO CHAT (Mensagens)
    chat: {
        src: "data:image/png;base64,SUA_IMAGEM_BASE64_AQUI",  // ← TROQUE AQUI!
        alt: "Dinah",
        size: "w-8 h-8 xl:w-10 xl:h-10 2xl:w-12 2xl:h-12"
    },
    
    // 🖼️ IMAGEM DO HEADER DO CHAT (Azul)
    chatHeader: {
        src: "data:image/png;base64,SUA_IMAGEM_BASE64_AQUI",  // ← TROQUE AQUI!
        alt: "Dinah",
        size: "w-12 h-12 xl:w-16 xl:h-16 2xl:w-20 2xl:h-20"
    },
    
    // 🖼️ IMAGEM DAS ABAS (Resumo, Contas, Transações)
    tabs: {
        src: "data:image/png;base64,SUA_IMAGEM_BASE64_AQUI",  // ← TROQUE AQUI!
        alt: "Dinah",
        size: "w-8 h-8"
    },
    
    // 🖼️ IMAGEM DO MODAL DE AJUDA
    helpModal: {
        src: "data:image/png;base64,SUA_IMAGEM_BASE64_AQUI",  // ← TROQUE AQUI!
        alt: "Dinah",
        size: "w-8 h-8"
    },
    

    
    // 🖼️ IMAGEM DO MODAL DE GERENCIAR CONTAS
    manageAccountsModal: {
        src: "data:image/png;base64,SUA_IMAGEM_BASE64_AQUI",  // ← TROQUE AQUI!
        alt: "Dinah",
        size: "w-16 h-16"
    }
};

// 🚀 FUNÇÃO PARA APLICAR TODAS AS IMAGENS BASE64
function aplicarAvataresBase64() {
    console.log("🎨 Aplicando TODOS os avatares Base64...");
    
    // 1. IMAGEM PRINCIPAL (Tela de Login)
    if (AVATAR_BASE64.main.src && AVATAR_BASE64.main.src !== "data:image/png;base64,SUA_IMAGEM_BASE64_AQUI") {
        const mainAvatar = document.querySelector('#login-screen .w-20.h-20');
        if (mainAvatar) {
            mainAvatar.innerHTML = `
                <img src="${AVATAR_BASE64.main.src}" alt="${AVATAR_BASE64.main.alt}" 
                     class="w-full h-full object-cover rounded-2xl shadow-2xl">
            `;
        }
    }
    
    // 2. IMAGEM DO HEADER
    if (AVATAR_BASE64.header.src && AVATAR_BASE64.header.src !== "data:image/png;base64,SUA_IMAGEM_BASE64_AQUI") {
        const headerAvatar = document.querySelector('header .w-10.h-10');
        if (headerAvatar) {
            headerAvatar.innerHTML = `
                <img src="${AVATAR_BASE64.header.src}" alt="${AVATAR_BASE64.header.alt}" 
                     class="w-full h-full object-cover rounded-xl shadow-md">
            `;
        }
    }
    
    // 3. IMAGEM DO CHAT (Mensagens)
    if (AVATAR_BASE64.chat.src && AVATAR_BASE64.chat.src !== "data:image/png;base64,SUA_IMAGEM_BASE64_AQUI") {
        const chatAvatars = document.querySelectorAll('#chat-messages .w-8.h-8, #chat-messages .xl\\:w-10.xl\\:h-10, #chat-messages .2xl\\:w-12.2xl\\:h-12');
        chatAvatars.forEach(avatar => {
            avatar.innerHTML = `
                <img src="${AVATAR_BASE64.chat.src}" alt="${AVATAR_BASE64.chat.alt}" 
                     class="w-full h-full object-cover rounded-full shadow-md">
            `;
        });
    }
    
    // 4. IMAGEM DO HEADER DO CHAT (Azul)
    if (AVATAR_BASE64.chatHeader.src && AVATAR_BASE64.chatHeader.src !== "data:image/png;base64,SUA_IMAGEM_BASE64_AQUI") {
        const chatHeaderAvatar = document.querySelector('.bg-gradient-to-r.from-blue-600.to-indigo-700 .w-12.h-12, .bg-gradient-to-r.from-blue-600.to-indigo-700 .xl\\:w-16.xl\\:h-16, .bg-gradient-to-r.from-blue-600.to-indigo-700 .2xl\\:w-20.2xl\\:h-20');
        if (chatHeaderAvatar) {
            chatHeaderAvatar.innerHTML = `
                <img src="${AVATAR_BASE64.chatHeader.src}" alt="${AVATAR_BASE64.chatHeader.alt}" 
                     class="w-full h-full object-cover rounded-2xl shadow-lg">
            `;
        }
    }
    
    // 5. IMAGEM DAS ABAS (Resumo, Contas, Transações)
    if (AVATAR_BASE64.tabs.src && AVATAR_BASE64.tabs.src !== "data:image/png;base64,SUA_IMAGEM_BASE64_AQUI") {
        const tabAvatars = document.querySelectorAll('#sidebar .w-8.h-8.bg-gradient-to-br.from-purple-500');
        tabAvatars.forEach(avatar => {
            avatar.innerHTML = `
                <img src="${AVATAR_BASE64.tabs.src}" alt="${AVATAR_BASE64.tabs.alt}" 
                     class="w-full h-full object-cover rounded-lg shadow-md">
            `;
        });
    }
    
    // 6. IMAGEM DO MODAL DE AJUDA
    if (AVATAR_BASE64.helpModal.src && AVATAR_BASE64.helpModal.src !== "data:image/png;base64,SUA_IMAGEM_BASE64_AQUI") {
        const helpModalAvatar = document.querySelector('#help-modal .w-8.h-8.bg-gradient-to-br.from-purple-500');
        if (helpModalAvatar) {
            helpModalAvatar.innerHTML = `
                <img src="${AVATAR_BASE64.helpModal.src}" alt="${AVATAR_BASE64.helpModal.alt}" 
                     class="w-full h-full object-cover rounded-lg shadow-md">
            `;
        }
    }
    

    
    // 8. IMAGEM DO MODAL DE GERENCIAR CONTAS
    if (AVATAR_BASE64.manageAccountsModal.src && AVATAR_BASE64.manageAccountsModal.src !== "data:image/png;base64,SUA_IMAGEM_BASE64_AQUI") {
        const manageAccountsModalAvatar = document.querySelector('#manage-accounts-modal .w-16.h-16.bg-gradient-to-br.from-purple-500');
        if (manageAccountsModalAvatar) {
            manageAccountsModalAvatar.innerHTML = `
                <img src="${AVATAR_BASE64.manageAccountsModal.src}" alt="${AVATAR_BASE64.manageAccountsModal.alt}" 
                     class="w-full h-full object-cover rounded-full shadow-lg">
            `;
        }
    }
    
    console.log("✅ TODOS os avatares Base64 aplicados!");
}

// 📋 FUNÇÃO PARA TROCAR IMAGEM BASE64 EM TEMPO REAL
function trocarAvatarBase64(tipo, novaImagemBase64) {
    if (AVATAR_BASE64[tipo]) {
        AVATAR_BASE64[tipo].src = novaImagemBase64;
        aplicarAvataresBase64();
        console.log(`🔄 Avatar ${tipo} trocado para Base64!`);
    }
}

// 🔄 FUNÇÃO PARA TROCAR TODOS OS AVATARES DE UMA VEZ
function trocarTodosAvataresBase64(novaImagemBase64) {
    Object.keys(AVATAR_BASE64).forEach(tipo => {
        AVATAR_BASE64[tipo].src = novaImagemBase64;
    });
    aplicarAvataresBase64();
    console.log("🔄 TODOS os avatares trocados para Base64!");
}

// 🎯 APLICAR AUTOMATICAMENTE QUANDO A PÁGINA CARREGAR
document.addEventListener('DOMContentLoaded', aplicarAvataresBase64);
