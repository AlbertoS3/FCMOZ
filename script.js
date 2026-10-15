/* =====================================================
   VINGLINK 4.0
   SCRIPT.JS
   PARTE 1/5

   Firebase
   Autenticação
   Cadastro
   Login
   Recuperação de senha
===================================================== */


/* =====================================================
   1. FIREBASE IMPORTS
===================================================== */

import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  signOut
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

import {
  getFirestore,
  collection,
  doc,
  getDoc,
  addDoc,
  setDoc,
  updateDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  arrayUnion,
  arrayRemove
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-storage.js";


/* =====================================================
   2. CONFIGURAÇÃO FIREBASE
===================================================== */

const firebaseConfig = {
  apiKey: "AIzaSyAdoQPlU9gBT7FluVeKqW4hBs-zaxlDGuc",
  authDomain: "vinglink-3fd3f.firebaseapp.com",
  projectId: "vinglink-3fd3f",
  storageBucket: "vinglink-3fd3f.firebasestorage.app",
  messagingSenderId: "15922025000",
  appId: "1:15922025000:web:50a7e0a53d8a6109d39b1d",
  measurementId: "G-5VDQ53Z2DC"
};


/* =====================================================
   3. INICIALIZAR FIREBASE
===================================================== */

const firebaseApp =
  initializeApp(firebaseConfig);

const auth =
  getAuth(firebaseApp);

const db =
  getFirestore(firebaseApp);

const storage =
  getStorage(firebaseApp);


/* =====================================================
   4. VARIÁVEIS GLOBAIS
===================================================== */

let currentUser = null;

let todosUsuarios = [];

const listeners = [];


/* =====================================================
   5. FUNÇÃO $
===================================================== */

function $(seletor) {
  return document.querySelector(seletor);
}


/* =====================================================
   6. ESCAPAR TEXTO
===================================================== */

function escapar(texto) {

  return String(texto ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


/* =====================================================
   7. AVATAR
===================================================== */

function avatar(usuario) {

  if (
    usuario &&
    usuario.avatar
  ) {
    return usuario.avatar;
  }

  return "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300";
}


/* =====================================================
   8. TOAST
===================================================== */

function toast(texto) {

  const elemento =
    $("#toast");

  if (!elemento) {
    return;
  }

  elemento.textContent =
    texto;

  elemento.classList.remove(
    "hidden"
  );

  clearTimeout(
    window.vinglinkToastTimer
  );

  window.vinglinkToastTimer =
    setTimeout(() => {

      elemento.classList.add(
        "hidden"
      );

    }, 2500);
}


/* =====================================================
   9. MENSAGEM DE ERRO
===================================================== */

function mensagemErro(erro) {

  console.error(
    "Vinglink:",
    erro
  );

  const elemento =
    $("#authMsg");

  if (!elemento) {
    return;
  }

  let mensagem =
    erro?.message ||
    "Ocorreu um erro.";

  if (
    erro?.code ===
    "auth/email-already-in-use"
  ) {
    mensagem =
      "Este email já está cadastrado.";
  }

  else if (
    erro?.code ===
    "auth/invalid-email"
  ) {
    mensagem =
      "O email não é válido.";
  }

  else if (
    erro?.code ===
    "auth/weak-password"
  ) {
    mensagem =
      "A palavra-passe é muito fraca.";
  }

  else if (
    erro?.code ===
    "auth/invalid-credential"
  ) {
    mensagem =
      "Email ou palavra-passe incorretos.";
  }

  elemento.textContent =
    mensagem;
}


/* =====================================================
   10. MOSTRAR LOGIN
===================================================== */

function mostrarLogin() {

  const authTela =
    $("#auth");

  const main =
    $("#main");

  if (authTela) {
    authTela.classList.remove(
      "hidden"
    );
  }

  if (main) {
    main.classList.add(
      "hidden"
    );
  }
}


/* =====================================================
   11. MOSTRAR APLICAÇÃO
===================================================== */

function mostrarApp() {

  const authTela =
    $("#auth");

  const main =
    $("#main");

  if (authTela) {
    authTela.classList.add(
      "hidden"
    );
  }

  if (main) {
    main.classList.remove(
      "hidden"
    );
  }

  navegar("home");
}


/* =====================================================
   12. GARANTIR UTILIZADOR
===================================================== */

async function garantirUsuario(usuario) {

  if (!usuario) {
    return;
  }

  const referencia =
    doc(
      db,
      "users",
      usuario.uid
    );

  const documento =
    await getDoc(
      referencia
    );

  if (!documento.exists()) {

    await setDoc(
      referencia,
      {
        uid:
          usuario.uid,

        name:
          usuario.displayName ||
          "Utilizador",

        email:
          usuario.email ||
          "",

        avatar:
          usuario.photoURL ||
          "",

        bio:
          "",

        followers:
          [],

        following:
          [],

        createdAt:
          serverTimestamp()
      }
    );

  }
}


/* =====================================================
   13. MEU PERFIL
===================================================== */

async function meuPerfil() {

  if (!currentUser) {
    return null;
  }

  const referencia =
    doc(
      db,
      "users",
      currentUser.uid
    );

  const documento =
    await getDoc(
      referencia
    );

  if (!documento.exists()) {
    return null;
  }

  return {
    id:
      documento.id,

    ...documento.data()
  };
}


/* =====================================================
   14. CADASTRO
===================================================== */

const signupBtn =
  $("#signupBtn");

if (signupBtn) {

  signupBtn.addEventListener(
    "click",
    criarConta
  );
}


async function criarConta() {

  try {

    const nome =
      $("#name")?.value
        ?.trim() || "";

    const email =
      $("#email")?.value
        ?.trim() || "";

    const senha =
      $("#password")?.value || "";


    if (!nome) {

      throw new Error(
        "Digite o seu nome."
      );

    }

    if (!email) {

      throw new Error(
        "Digite o seu email."
      );

    }

    if (senha.length < 6) {

      throw new Error(
        "A palavra-passe precisa ter pelo menos 6 caracteres."
      );

    }


    const credencial =
      await createUserWithEmailAndPassword(
        auth,
        email,
        senha
      );


    await updateProfile(
      credencial.user,
      {
        displayName:
          nome
      }
    );


    await garantirUsuario(
      credencial.user
    );


    toast(
      "Conta criada com sucesso 🎉"
    );


  } catch (erro) {

    mensagemErro(
      erro
    );

  }
}


/* =====================================================
   15. LOGIN
===================================================== */

const loginBtn =
  $("#loginBtn");

if (loginBtn) {

  loginBtn.addEventListener(
    "click",
    entrar
  );
}


async function entrar() {

  try {

    const email =
      $("#email")?.value
        ?.trim() || "";

    const senha =
      $("#password")?.value || "";


    if (!email || !senha) {

      throw new Error(
        "Preencha email e palavra-passe."
      );

    }


    await signInWithEmailAndPassword(
      auth,
      email,
      senha
    );


    toast(
      "Bem-vindo à Vinglink!"
    );


  } catch (erro) {

    mensagemErro(
      erro
    );

  }
}


/* =====================================================
   16. RECUPERAR PALAVRA-PASSE
===================================================== */

const resetBtn =
  $("#resetBtn");

if (resetBtn) {

  resetBtn.addEventListener(
    "click",
    recuperarSenha
  );
}


async function recuperarSenha() {

  try {

    const email =
      $("#email")?.value
        ?.trim() || "";


    if (!email) {

      throw new Error(
        "Digite o seu email primeiro."
      );

    }


    await sendPasswordResetEmail(
      auth,
      email
    );


    toast(
      "Email de recuperação enviado."
    );


  } catch (erro) {

    mensagemErro(
      erro
    );

  }
}


/* =====================================================
   17. ESTADO DE AUTENTICAÇÃO
===================================================== */

onAuthStateChanged(
  auth,
  async (usuario) => {

    currentUser =
      usuario;


    if (usuario) {

      try {

        await garantirUsuario(
          usuario
        );

        mostrarApp();

        iniciarListeners();

      } catch (erro) {

        console.error(
          "Erro ao iniciar utilizador:",
          erro
        );

        mensagemErro(
          erro
        );

      }

    } else {

      mostrarLogin();

    }

  }
);
/* =====================================================
   VINGLINK 4.0
   PARTE 2/5

   Navegação
   Feed
   Publicações
   Curtidas
   Comentários
   Partilha
===================================================== */


/* =====================================================
   18. NAVEGAÇÃO
===================================================== */

function navegar(tela) {

  document
    .querySelectorAll(".screen")
    .forEach(elemento => {

      elemento.classList.add(
        "hidden"
      );

    });


  const destino =
    document.getElementById(
      tela
    );


  if (destino) {

    destino.classList.remove(
      "hidden"
    );

  }


  document
    .querySelectorAll(".nav button")
    .forEach(botao => {

      botao.classList.toggle(
        "active",
        botao.dataset.go === tela
      );

    });

}


/* =====================================================
   19. BOTÕES DATA-GO
===================================================== */

document
  .querySelectorAll("[data-go]")
  .forEach(botao => {

    botao.addEventListener(
      "click",
      () => {

        navegar(
          botao.dataset.go
        );

      }
    );

  });


/* =====================================================
   20. INICIAR LISTENERS
===================================================== */

function iniciarListeners() {

  listeners.forEach(
    cancelar => {

      try {
        cancelar();
      } catch (erro) {
        console.error(erro);
      }

    }
  );


  listeners.length = 0;


  iniciarFeed();

  iniciarUsuarios();

  iniciarNotificacoes();

  renderizarStories();

  renderizarPerfil();

  renderizarChat();

}


/* =====================================================
   21. FEED
===================================================== */

function iniciarFeed() {

  const consulta =
    query(
      collection(
        db,
        "posts"
      ),
      orderBy(
        "createdAt",
        "desc"
      ),
      limit(50)
    );


  const cancelar =
    onSnapshot(
      consulta,
      snapshot => {

        const posts =
          snapshot.docs.map(
            documento => ({

              id:
                documento.id,

              ...documento.data()

            })
          );


        renderizarFeed(
          posts
        );

      },
      erro => {

        console.error(
          "Erro no feed:",
          erro
        );

        const feed =
          $("#feed");

        if (feed) {

          feed.innerHTML = `
            <div class="loading">
              Não foi possível carregar o feed.
            </div>
          `;

        }

      }
    );


  listeners.push(
    cancelar
  );

}


/* =====================================================
   22. RENDERIZAR FEED
===================================================== */

function renderizarFeed(posts) {

  const feed =
    $("#feed");

  if (!feed) {
    return;
  }


  if (!posts.length) {

    feed.innerHTML = `

      <div class="loading">

        Ainda não existem publicações.

        <br><br>

        Seja o primeiro a publicar! 🚀

      </div>

    `;

    return;
  }


  feed.innerHTML =
    posts.map(post => {

      const liked =
        Array.isArray(
          post.likedBy
        ) &&
        currentUser &&
        post.likedBy.includes(
          currentUser.uid
        );


      return `

        <article class="card">

          <div class="user">

            <img
              src="${avatar(post)}"
              alt="Avatar"
            >

            <div>

              <b>
                ${escapar(
                  post.userName ||
                  "Utilizador"
                )}
              </b>

              <span>
                Vinglink · público
              </span>

            </div>

          </div>


          ${
            post.mediaUrl
              ? `
                <img
                  class="postimg"
                  src="${post.mediaUrl}"
                  alt="Publicação"
                >
              `
              : ""
          }


          <div class="actions">

            <button
              type="button"
              onclick="curtirPost(
                '${post.id}',
                ${liked}
              )"
            >
              ${
                liked
                  ? "♥"
                  : "♡"
              }
            </button>


            <button
              type="button"
              onclick="comentarPost(
                '${post.id}'
              )"
            >
              💬
            </button>


            <button
              type="button"
              onclick="partilharPost(
                '${post.id}'
              )"
            >
              ↗
            </button>


            <button
              type="button"
              class="save"
              onclick="salvarPost(
                '${post.id}'
              )"
            >
              ▱
            </button>

          </div>


          <div class="meta">

            <b>
              ${post.likes || 0}
              gostos
            </b>

          </div>


          <div class="caption">

            <b>
              ${escapar(
                post.userName ||
                ""
              )}
            </b>

            ${escapar(
              post.caption ||
              ""
            )}

          </div>

        </article>

      `;

    }).join("");

}


/* =====================================================
   23. CRIAR PUBLICAÇÃO
===================================================== */

const publishBtn =
  $("#publishBtn");

if (publishBtn) {

  publishBtn.addEventListener(
    "click",
    criarPublicacao
  );

}


async function criarPublicacao() {

  try {

    if (!currentUser) {

      throw new Error(
        "Faça login primeiro."
      );

    }


    const texto =
      $("#caption")?.value
        ?.trim() || "";

    const arquivo =
      $("#photo")?.files?.[0] ||
      null;


    if (!texto && !arquivo) {

      throw new Error(
        "Escreva algo ou escolha uma fotografia."
      );

    }


    const status =
      $("#uploadStatus");

    if (status) {

      status.textContent =
        "Publicando...";

    }


    let urlImagem = "";


    if (arquivo) {

      if (
        arquivo.size >
        20 * 1024 * 1024
      ) {

        throw new Error(
          "A imagem deve ter no máximo 20 MB."
        );

      }


      const nomeSeguro =
        arquivo.name
          .replace(
            /[^a-zA-Z0-9._-]/g,
            "_"
          );


      const nomeArquivo =
        Date.now() +
        "_" +
        nomeSeguro;


      const referencia =
        ref(
          storage,
          "posts/" +
          currentUser.uid +
          "/" +
          nomeArquivo
        );


      await uploadBytes(
        referencia,
        arquivo
      );


      urlImagem =
        await getDownloadURL(
          referencia
        );

    }


    const usuario =
      await meuPerfil();


    await addDoc(
      collection(
        db,
        "posts"
      ),
      {

        uid:
          currentUser.uid,

        userName:
          usuario?.name ||
          currentUser.displayName ||
          "Utilizador",

        avatar:
          usuario?.avatar ||
          currentUser.photoURL ||
          "",

        caption:
          texto,

        mediaUrl:
          urlImagem,

        likes:
          0,

        likedBy:
          [],

        createdAt:
          serverTimestamp()

      }
    );


    if ($("#caption")) {
      $("#caption").value = "";
    }

    if ($("#photo")) {
      $("#photo").value = "";
    }

    if (status) {
      status.textContent = "";
    }


    navegar("home");


    toast(
      "Publicação criada 🎉"
    );


  } catch (erro) {

    console.error(
      "Erro ao publicar:",
      erro
    );


    const status =
      $("#uploadStatus");

    if (status) {
      status.textContent = "";
    }


    alert(
      erro.message ||
      "Não foi possível publicar."
    );

  }

}


/* =====================================================
   24. CURTIR PUBLICAÇÃO
===================================================== */

window.curtirPost =
  async function(
    id,
    jaCurtiu
  ) {

    try {

      if (!currentUser) {
        return;
      }


      const referencia =
        doc(
          db,
          "posts",
          id
        );


      const documento =
        await getDoc(
          referencia
        );


      if (!documento.exists()) {
        return;
      }


      const post =
        documento.data();


      const likes =
        Number(
          post.likes || 0
        );


      if (jaCurtiu) {

        await updateDoc(
          referencia,
          {

            likes:
              Math.max(
                0,
                likes - 1
              ),

            likedBy:
              arrayRemove(
                currentUser.uid
              )

          }
        );

      } else {

        await updateDoc(
          referencia,
          {

            likes:
              likes + 1,

            likedBy:
              arrayUnion(
                currentUser.uid
              )

          }
        );

      }

    } catch (erro) {

      console.error(
        "Erro ao curtir:",
        erro
      );

    }

  };


/* =====================================================
   25. COMENTAR
===================================================== */

window.comentarPost =
  async function(id) {

    if (!currentUser) {
      return;
    }


    const texto =
      prompt(
        "Escreva o seu comentário:"
      );


    if (
      !texto ||
      !texto.trim()
    ) {
      return;
    }


    try {

      await addDoc(
        collection(
          db,
          "posts",
          id,
          "comments"
        ),
        {

          uid:
            currentUser.uid,

          text:
            texto.trim(),

          createdAt:
            serverTimestamp()

        }
      );


      toast(
        "Comentário publicado 💬"
      );


    } catch (erro) {

      console.error(
        "Erro no comentário:",
        erro
      );

      alert(
        "Não foi possível comentar."
      );

    }

  };


/* =====================================================
   26. PARTILHAR
===================================================== */

window.partilharPost =
  async function(id) {

    const link =
      window.location.origin +
      window.location.pathname +
      "#post=" +
      id;


    try {

      if (
        navigator.clipboard
      ) {

        await navigator.clipboard
          .writeText(link);

        toast(
          "Link copiado!"
        );

      } else {

        toast(
          "Link pronto para partilhar."
        );

      }

    } catch (erro) {

      console.error(erro);

      toast(
        "Link pronto para partilhar."
      );

    }

  };


/* =====================================================
   27. SALVAR
===================================================== */

window.salvarPost =
  function(id) {

    toast(
      "Publicação salva."
    );

  };
/* =====================================================
   VINGLINK 4.0
   PARTE 3/5

   Explorar
   Pesquisa
   Utilizadores
   Seguidores
===================================================== */


/* =====================================================
   28. UTILIZADORES
===================================================== */

function iniciarUsuarios() {

  const container =
    $("#users");

  if (!container) {
    return;
  }


  const consulta =
    query(
      collection(
        db,
        "users"
      ),
      orderBy(
        "createdAt",
        "desc"
      ),
      limit(100)
    );


  const cancelar =
    onSnapshot(
      consulta,
      snapshot => {

        todosUsuarios =
          snapshot.docs.map(
            documento => ({

              id:
                documento.id,

              ...documento.data()

            })
          );


        renderizarUsuarios();

      },
      erro => {

        console.error(
          "Erro nos utilizadores:",
          erro
        );

        container.innerHTML = `
          <div class="loading">
            Não foi possível carregar utilizadores.
          </div>
        `;

      }
    );


  listeners.push(
    cancelar
  );


  const search =
    $("#search");

  if (search) {

    search.addEventListener(
      "input",
      renderizarUsuarios
    );

  }

}


/* =====================================================
   29. RENDERIZAR UTILIZADORES
===================================================== */

function renderizarUsuarios() {

  const container =
    $("#users");

  if (!container) {
    return;
  }


  if (!currentUser) {
    return;
  }


  const campo =
    $("#search");


  const pesquisa =
    (
      campo?.value ||
      ""
    )
      .toLowerCase()
      .trim();


  const usuarios =
    todosUsuarios.filter(
      usuario => {

        if (
          usuario.uid ===
          currentUser.uid
        ) {
          return false;
        }


        const nome =
          (
            usuario.name ||
            ""
          )
            .toLowerCase();


        return nome.includes(
          pesquisa
        );

      }
    );


  if (!usuarios.length) {

    container.innerHTML = `

      <div class="loading">

        Nenhum utilizador encontrado.

      </div>

    `;

    return;
  }


  container.innerHTML =
    usuarios.map(
      usuario => {

        const seguidores =
          Array.isArray(
            usuario.followers
          )
            ? usuario.followers
            : [];


        const seguindo =
          seguidores.includes(
            currentUser.uid
          );


        return `

          <div class="item">

            <img
              src="${avatar(usuario)}"
              alt="Avatar"
            >


            <main>

              <b>
                ${escapar(
                  usuario.name ||
                  "Utilizador"
                )}
              </b>

              <small>

                ${
                  seguidores.length
                }

                seguidores

              </small>

            </main>


            <button
              type="button"
              class="secondary"
              onclick="seguirUsuario(
                '${usuario.uid}',
                ${seguindo}
              )"
            >

              ${
                seguindo
                  ? "Seguindo"
                  : "Seguir"
              }

            </button>

          </div>

        `;

      }
    ).join("");

}


/* =====================================================
   30. SEGUIR UTILIZADOR
===================================================== */

window.seguirUsuario =
  async function(
    uid,
    seguindo
  ) {

    try {

      if (!currentUser) {
        return;
      }


      if (
        uid ===
        currentUser.uid
      ) {
        return;
      }


      const meuRef =
        doc(
          db,
          "users",
          currentUser.uid
        );


      const outroRef =
        doc(
          db,
          "users",
          uid
        );


      if (seguindo) {

        await updateDoc(
          meuRef,
          {

            following:
              arrayRemove(uid)

          }
        );


        await updateDoc(
          outroRef,
          {

            followers:
              arrayRemove(
                currentUser.uid
              )

          }
        );


        toast(
          "Deixaste de seguir."
        );


      } else {

        await updateDoc(
          meuRef,
          {

            following:
              arrayUnion(uid)

          }
        );


        await updateDoc(
          outroRef,
          {

            followers:
              arrayUnion(
                currentUser.uid
              )

          }
        );


        toast(
          "Agora estás a seguir."
        );

      }


      renderizarPerfil();


    } catch (erro) {

      console.error(
        "Erro ao seguir utilizador:",
        erro
      );


      toast(
        "Não foi possível atualizar."
      );

    }

  };
/* =====================================================
   VINGLINK 4.0
   PARTE 4/5

   Perfil
   Stories
   Chat
   Notificações
   Editar perfil
===================================================== */


/* =====================================================
   31. PERFIL
===================================================== */

async function renderizarPerfil() {

  const container =
    $("#profileBody");

  if (!container || !currentUser) {
    return;
  }


  try {

    const usuario =
      await meuPerfil();


    if (!usuario) {

      container.innerHTML = `

        <div class="loading">

          Perfil não encontrado.

        </div>

      `;

      return;
    }


    const followers =
      Array.isArray(
        usuario.followers
      )
        ? usuario.followers.length
        : 0;


    const following =
      Array.isArray(
        usuario.following
      )
        ? usuario.following.length
        : 0;


    container.innerHTML = `

      <div class="profile-card">

        <img
          class="profile-avatar"
          src="${avatar(usuario)}"
          alt="Avatar"
        >


        <h2>
          ${escapar(
            usuario.name ||
            "Utilizador"
          )}
        </h2>


        <p>
          ${escapar(
            usuario.bio ||
            "Ainda sem biografia."
          )}
        </p>


        <div class="profile-stats">

          <span>

            <b>
              ${followers}
            </b>

            seguidores

          </span>


          <span>

            <b>
              ${following}
            </b>

            seguindo

          </span>

        </div>

      </div>

    `;

  } catch (erro) {

    console.error(
      "Erro no perfil:",
      erro
    );

  }

}


/* =====================================================
   32. STORIES
===================================================== */

function renderizarStories() {

  const stories =
    $("#stories");

  if (!stories) {
    return;
  }


  stories.innerHTML = `

    <div
      class="story"
      onclick="criarStory()"
    >

      <div class="story-avatar">
        ＋
      </div>

      <small>
        Criar
      </small>

    </div>

  `;

}


/* =====================================================
   33. CRIAR STORY
===================================================== */

window.criarStory =
  function() {

    toast(
      "Stories em breve 🚀"
    );

  };


/* =====================================================
   34. CHAT
===================================================== */

function renderizarChat() {

  const chat =
    $("#chatList");

  if (!chat) {
    return;
  }


  chat.innerHTML = `

    <div class="loading">

      Ainda não existem conversas.

      <br><br>

      O sistema de mensagens será conectado
      ao Firestore nesta área.

    </div>

  `;

}


/* =====================================================
   35. NOTIFICAÇÕES
===================================================== */

function iniciarNotificacoes() {

  const container =
    $("#notificationsBody");

  if (!container) {
    return;
  }


  container.innerHTML = `

    <div class="loading">

      Ainda não existem notificações.

    </div>

  `;

}


/* =====================================================
   36. EDITAR PERFIL
===================================================== */

const editBtn =
  $("#editBtn");


if (editBtn) {

  editBtn.addEventListener(
    "click",
    editarPerfil
  );

}


async function editarPerfil() {

  try {

    if (!currentUser) {
      return;
    }


    const usuario =
      await meuPerfil();


    if (!usuario) {
      return;
    }


    const novoNome =
      prompt(
        "Nome:",
        usuario.name ||
        ""
      );


    if (
      novoNome === null
    ) {
      return;
    }


    if (
      !novoNome.trim()
    ) {

      toast(
        "O nome não pode ficar vazio."
      );

      return;
    }


    const novaBio =
      prompt(
        "Biografia:",
        usuario.bio ||
        ""
      );


    await updateDoc(
      doc(
        db,
        "users",
        currentUser.uid
      ),
      {

        name:
          novoNome.trim(),

        bio:
          novaBio
            ?.trim() ||
          ""

      }
    );


    await updateProfile(
      currentUser,
      {

        displayName:
          novoNome.trim()

      }
    );


    await renderizarPerfil();


    toast(
      "Perfil atualizado."
    );


  } catch (erro) {

    console.error(
      "Erro ao editar perfil:",
      erro
    );


    toast(
      "Não foi possível atualizar."
    );

  }

}


/* =====================================================
   37. LOGOUT
===================================================== */

window.sair =
  async function() {

    try {

      await signOut(
        auth
      );

      toast(
        "Sessão terminada."
      );

    } catch (erro) {

      console.error(
        erro
      );

    }

  };
/* =====================================================
   VINGLINK 4.0
   PARTE 5/5

   Finalização
===================================================== */


/* =====================================================
   38. LIMPAR CAMPOS AO ABRIR LOGIN
===================================================== */

function limparMensagemAuth() {

  const elemento =
    $("#authMsg");

  if (elemento) {

    elemento.textContent =
      "";

  }

}


const camposAuth =
  document.querySelectorAll(
    "#name, #email, #password"
  );


camposAuth.forEach(
  campo => {

    campo.addEventListener(
      "input",
      () => {

        limparMensagemAuth();

      }
    );

  }
);


/* =====================================================
   39. ENTER NO LOGIN
===================================================== */

const passwordField =
  $("#password");


if (passwordField) {

  passwordField.addEventListener(
    "keydown",
    evento => {

      if (
        evento.key ===
        "Enter"
      ) {

        if (currentUser) {
          return;
        }

        entrar();

      }

    }
  );

}


/* =====================================================
   40. PREVENIR SUBMIT ACIDENTAL
===================================================== */

document
  .querySelectorAll(
    "form"
  )
  .forEach(
    formulario => {

      formulario.addEventListener(
        "submit",
        evento => {

          evento.preventDefault();

        }
      );

    }
  );


/* =====================================================
   41. ERRO GLOBAL
===================================================== */

window.addEventListener(
  "error",
  evento => {

    console.error(
      "Erro JavaScript:",
      evento.error ||
      evento.message
    );

  }
);


/* =====================================================
   42. PROMISES NÃO TRATADAS
===================================================== */

window.addEventListener(
  "unhandledrejection",
  evento => {

    console.error(
      "Promise rejeitada:",
      evento.reason
    );

  }
);


/* =====================================================
   43. CONSOLE
===================================================== */

console.log(
  "===================================="
);

console.log(
  "VINGLINK 4.0"
);

console.log(
  "Firebase inicializado."
);

console.log(
  "Script carregado corretamente."
);

console.log(
  "===================================="
);