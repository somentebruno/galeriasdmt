# Saúde Digital MT - Galeria ☁️

> Uma solução moderna e unificada para gerenciamento de mídia, inspirada na experiência fluida do Google Photos. 

**Saúde Digital MT - Galeria** é uma aplicação de galeria de última geração que centraliza o armazenamento de fotos e vídeos em uma interface intuitiva. O sistema permite o upload direto de arquivos e a integração de vídeos do YouTube, tratando todos os formatos de mídia como cidadãos de primeira classe na experiência do usuário.

## ✨ Funcionalidades Principais

### 🖼️ Galeria Unificada
Visualize fotos e vídeos em uma grade harmoniosa. A interface combina uploads locais (Supabase Storage) e embeds externos (YouTube) sem fricção.

### 🔍 Busca Global
Encontre o que precisa rapidamente. A barra de pesquisa inteligente filtra conteúdos na Galeria, na Lixeira e na aba Explorar em tempo real.

### 🗑️ Lixeira & Recuperação
Segurança em primeiro lugar. O sistema de "Soft Delete" garante que itens excluídos possam ser **restaurados** em até 30 dias antes da exclusão permanente.

### 🌍 Modo Explorar
Descubra suas memórias através de categorias inteligentes:
- **Pessoas**: Agrupamento por reconhecimento facial (Simulado).
- **Lugares**: Mapa interativo e filtro por localização.
- **Coisas**: Identificação de objetos e cenários.

### ⚡ Upload Híbrido
Flexibilidade total para adicionar conteúdo:
- **Arquivos Locais**: Drag & drop para imagens e vídeos.
- **Links Externos**: Adicione vídeos do YouTube apenas colando a URL.

---

## 🛠️ Stack Tecnológica

Construído com tecnologias modernas para garantir performance, escalabilidade e uma UX premium.

| Categoria | Tecnologias |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite |
| **Estilização** | Tailwind CSS 3 (Design System customizado) |
| **Backend** | Supabase (PostgreSQL, Auth, Storage, Edge Functions) |
| **Icons** | Material Icons (Google) |

---

## 🚀 Como Rodar Localmente

1. **Clone o repositório**
   ```bash
   git clone https://github.com/somentebruno/galeriasdmt.git
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente**
   Crie um arquivo `.env.local` na raiz do projeto:
   ```env
   VITE_SUPABASE_URL=sua_url_supabase
   VITE_SUPABASE_ANON_KEY=sua_chave_anonima
   ```

4. **Execute o projeto**
   ```bash
   npm run dev
   ```

---

## 👨‍💻 Autor

<div align="center">
  <br />
  <img src="https://github.com/somentebruno.png" width="120px;" style="border-radius: 50%;" alt="Bruno Fernandes"/>
  <br />
  <br />
  <h3>Bruno Fernandes</h3>
  <p><b>Engenheiro de Software | Full Stack Developer</b></p>
  <p>Especialista em conectar arquitetura robusta com interfaces de alto padrão.<br/>Focado em Java (Spring Boot), React/Next.js e Cloud.</p>

  <p>
    <a href="https://www.linkedin.com/in/blsf/" target="_blank">
      <img src="https://img.shields.io/badge/-LinkedIn-%230077B5?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn">
    </a> 
    <a href="mailto:brunolucasdev@gmail.com">
        <img src="https://img.shields.io/badge/-Gmail-%23D14836?style=for-the-badge&logo=gmail&logoColor=white" alt="Gmail">
    </a>
    <a href="https://brunolucasdev.com" target="_blank">
        <img src="https://img.shields.io/badge/-Portfolio-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Portfolio">
    </a>
  </p>
</div>
