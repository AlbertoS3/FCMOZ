/*
  EXEMPLO FUTURO: Firebase para login, comentários partilhados e painel de administração.
  Não é carregado pelo site por defeito. Cria o teu projeto em https://console.firebase.google.com/
  e ativa Authentication (Email/Password) e Cloud Firestore.
  Nunca coloques credenciais de servidor ou service-account no frontend.
*/
export const firebaseConfig = {
  apiKey: "COLOCA_AQUI_A_API_KEY_WEB",
  authDomain: "TEU-PROJETO.firebaseapp.com",
  projectId: "TEU-PROJETO",
  storageBucket: "TEU-PROJETO.firebasestorage.app",
  messagingSenderId: "COLOCA_AQUI",
  appId: "COLOCA_AQUI"
};
// A configuração web não é, por si só, uma senha secreta. Protege os dados com regras Firestore.
