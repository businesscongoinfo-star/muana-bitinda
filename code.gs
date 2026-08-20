/*******************************************************
 * MUANA BITINDA
 * PORTAIL PROFESSIONNEL DE GESTION LOGISTIQUE
 *
 * FICHIER : Code.gs
 *
 * Système :
 * - partenaires
 * - inscription
 * - connexion
 * - stock
 * - réceptions
 * - évacuations
 * - livraisons
 * - mouvements
 * - paiements
 * - administration
 *******************************************************/


/* =====================================================
   CONFIGURATION GENERALE
===================================================== */

const MB = {
  APP_NAME: 'MUANA BITINDA',
  VERSION: '3.0',

  SESSION_HOURS: 6,

  DEFAULT_ADMIN_EMAIL: 'admin@muanabitinda.site',
  DEFAULT_ADMIN_PASSWORD: 'MBadmin@2026',

  SHEETS: {
    DASHBOARD: 'TABLEAU DE BORD',
    PRODUCTS: 'PRODUITS',
    PARTNERS: 'PARTENAIRES',
    MOVEMENTS: 'MOUVEMENTS',
    DELIVERIES: 'LIVRAISONS',
    RECEIPTS: 'RÉCEPTIONS',
    EVACUATIONS: 'ÉVACUATIONS',
    USERS: 'UTILISATEURS',
    PAYMENTS: 'PAIEMENTS',
    SETTINGS: 'PARAMETRES'
  }
};


/* =====================================================
   STRUCTURE DES ONGLETS
===================================================== */

const HEADERS = {

  'PARTENAIRES': [
    'ID partenaire',
    'Nom entreprise',
    'Email',
    'Téléphone',
    'Adresse',
    'Ville',
    'Code partenaire',
    'Statut',
    'Date création',
    'Date modification'
  ],

  'PRODUITS': [
    'Code produit',
    'Nom produit',
    'Code partenaire',
    'Prix unitaire',
    'Stock initial',
    'Seuil alerte',
    'Stock disponible',
    'Statut',
    'Date création',
    'Date modification'
  ],

  'MOUVEMENTS': [
    'ID mouvement',
    'Date',
    'Code partenaire',
    'Code produit',
    'Type mouvement',
    'Entrée',
    'Sortie',
    'Quantité',
    'Motif',
    'Montant',
    'Référence',
    'Client / Destination',
    'Commentaire'
  ],

  'LIVRAISONS': [
    'ID livraison',
    'Date',
    'Code partenaire',
    'Code produit',
    'Commande',
    'Quantité',
    'Client',
    'Téléphone',
    'Adresse',
    'Montant produit',
    'Frais livraison',
    'Livreur',
    'Statut',
    'Référence',
    'Commentaire'
  ],

  'RÉCEPTIONS': [
    'ID réception',
    'Date',
    'Code partenaire',
    'Code produit',
    'Quantité reçue',
    'Prix unitaire',
    'Montant total',
    'Référence colis',
    'Réceptionné par',
    'Statut',
    'Commentaire'
  ],

  'ÉVACUATIONS': [
    'ID évacuation',
    'Date',
    'Code partenaire',
    'Code produit',
    'Quantité',
    'Motif',
    'Montant',
    'Référence',
    'Validé par',
    'Statut',
    'Commentaire'
  ],

  'UTILISATEURS': [
    'ID utilisateur',
    'Nom',
    'Email',
    'Téléphone',
    'Mot de passe',
    'Rôle',
    'Code partenaire',
    'Statut',
    'Date création',
    'Date modification'
  ],

  'PAIEMENTS': [
    'ID paiement',
    'Date',
    'Code partenaire',
    'Type',
    'Mode paiement',
    'Montant',
    'Statut',
    'Référence',
    'Commentaire'
  ],

  'PARAMETRES': [
    'Paramètre',
    'Valeur'
  ],

  'TABLEAU DE BORD': [
    'Indicateur',
    'Valeur'
  ]
};


/* =====================================================
   doGet
===================================================== */

function doGet(e) {

  return HtmlService
    .createHtmlOutputFromFile('Index')
    .setTitle('MUANA BITINDA - Gestion Logistique')
    .setXFrameOptionsMode(
      HtmlService.XFrameOptionsMode.ALLOWALL
    )
    .addMetaTag(
      'viewport',
      'width=device-width, initial-scale=1'
    );
}


/* =====================================================
   OUVERTURE DU FICHIER
===================================================== */

function getSpreadsheet_() {

  const ss =
    SpreadsheetApp.getActiveSpreadsheet();

  if (!ss) {
    throw new Error(
      'Impossible de trouver le Google Sheets lié au projet.'
    );
  }

  return ss;
}


/* =====================================================
   NORMALISATION DU NOM DES ONGLETS
===================================================== */

function normalizeName_(name) {

  return String(name || '')
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}


/* =====================================================
   TROUVER UN ONGLET
===================================================== */

function getSheet_(name) {

  const ss = getSpreadsheet_();

  let sheet =
    ss.getSheetByName(name);

  if (sheet) return sheet;

  const wanted =
    normalizeName_(name);

  const sheets =
    ss.getSheets();

  for (let i = 0; i < sheets.length; i++) {

    if (
      normalizeName_(sheets[i].getName())
      === wanted
    ) {
      return sheets[i];
    }
  }

  return null;
}


/* =====================================================
   CREER / PREPARER LES ONGLETS
===================================================== */

function setupSystem() {

  const ss = getSpreadsheet_();

  Object.keys(HEADERS).forEach(function(key) {

    const headers =
      HEADERS[key];

    let sheet =
      getSheet_(key);

    if (!sheet) {

      sheet =
        ss.insertSheet(key);
    }

    const currentLastColumn =
      Math.max(
        sheet.getLastColumn(),
        headers.length
      );

    const currentHeaders =
      sheet
        .getRange(
          1,
          1,
          1,
          currentLastColumn
        )
        .getValues()[0];

    headers.forEach(function(header, index) {

      if (
        !currentHeaders[index] ||
        String(currentHeaders[index]).trim() === ''
      ) {

        sheet
          .getRange(1, index + 1)
          .setValue(header);
      }

    });

    formatHeader_(sheet, headers.length);

  });


  createDefaultSettings_();
  createDefaultAdmin_();

  return {
    success: true,
    message:
      'Système MUANA BITINDA initialisé avec succès.'
  };
}


/* =====================================================
   FORMAT DES ENTETES
===================================================== */

function formatHeader_(sheet, columns) {

  if (!sheet || columns <= 0) return;

  sheet
    .getRange(1, 1, 1, columns)
    .setFontWeight('bold')
    .setBackground('#0f172a')
    .setFontColor('#ffffff')
    .setHorizontalAlignment('center');

  sheet.setFrozenRows(1);

  for (
    let c = 1;
    c <= columns;
    c++
  ) {

    sheet.autoResizeColumn(c);
  }
}


/* =====================================================
   PARAMETRES PAR DEFAUT
===================================================== */

function createDefaultSettings_() {

  const sheet =
    getSheet_(MB.SHEETS.SETTINGS);

  if (!sheet) return;

  const values =
    sheet.getDataRange().getValues();

  const existing = {};

  for (
    let i = 1;
    i < values.length;
    i++
  ) {

    const key =
      String(values[i][0] || '').trim();

    if (key) {
      existing[key] = true;
    }
  }

  const defaults = [

    [
      'NOM_APPLICATION',
      MB.APP_NAME
    ],

    [
      'DEVISE',
      'FCFA'
    ],

    [
      'SEUIL_DEFAUT',
      '10'
    ],

    [
      'STATUT_PARTENAIRE_DEFAUT',
      'EN ATTENTE'
    ]
  ];

  defaults.forEach(function(item) {

    if (!existing[item[0]]) {

      sheet.appendRow(item);
    }

  });
}


/* =====================================================
   CREATION ADMIN PAR DEFAUT
===================================================== */

function createDefaultAdmin_() {

  const sheet =
    getSheet_(MB.SHEETS.USERS);

  if (!sheet) return;

  const data =
    sheet.getDataRange().getValues();

  const email =
    MB.DEFAULT_ADMIN_EMAIL.toLowerCase();

  for (
    let i = 1;
    i < data.length;
    i++
  ) {

    if (
      String(data[i][2] || '')
        .trim()
        .toLowerCase()
      === email
    ) {

      return;
    }
  }

  sheet.appendRow([

    generateId_('USR'),

    'Administrateur',

    email,

    '',

    hashPassword_(
      MB.DEFAULT_ADMIN_PASSWORD
    ),

    'ADMIN',

    '',

    'ACTIF',

    new Date(),

    new Date()

  ]);
}


/* =====================================================
   GENERATION ID
===================================================== */

function generateId_(prefix) {

  return (
    prefix +
    '-' +
    Utilities.formatDate(
      new Date(),
      Session.getScriptTimeZone() ||
        'Africa/Brazzaville',
      'yyyyMMddHHmmss'
    ) +
    '-' +
    Math.floor(
      Math.random() * 100000
    )
  );
}


/* =====================================================
   GENERATION CODE PARTENAIRE
===================================================== */

function generatePartnerCode_() {

  const sheet =
    getSheet_(MB.SHEETS.PARTNERS);

  const data =
    sheet
      ? sheet.getDataRange().getValues()
      : [];

  let max = 0;

  for (
    let i = 1;
    i < data.length;
    i++
  ) {

    const code =
      String(data[i][6] || '');

    const match =
      code.match(/MB(\d+)/i);

    if (match) {

      max =
        Math.max(
          max,
          Number(match[1])
        );
    }
  }

  return (
    'MB' +
    String(max + 1)
      .padStart(5, '0')
  );
}


/* =====================================================
   MOT DE PASSE HASHÉ
===================================================== */

function hashPassword_(password) {

  const bytes =
    Utilities.computeDigest(
      Utilities.DigestAlgorithm.SHA_256,
      String(password),
      Utilities.Charset.UTF_8
    );

  return bytes
    .map(function(byte) {

      const value =
        byte < 0
          ? byte + 256
          : byte;

      return (
        value.toString(16)
          .padStart(2, '0')
      );

    })
    .join('');
}


/* =====================================================
   SESSION
===================================================== */

function createSession_(user) {

  const token =
    Utilities.getUuid();

  const cache =
    CacheService.getScriptCache();

  cache.put(
    'SESSION_' + token,
    JSON.stringify({
      id: user.id,
      email: user.email,
      role: user.role,
      partnerCode: user.partnerCode,
      name: user.name
    }),
    MB.SESSION_HOURS * 60 * 60
  );

  return token;
}


function getSession_(token) {

  if (!token) {
    throw new Error(
      'Session expirée. Veuillez vous reconnecter.'
    );
  }

  const cache =
    CacheService.getScriptCache();

  const value =
    cache.get(
      'SESSION_' + token
    );

  if (!value) {

    throw new Error(
      'Session expirée. Veuillez vous reconnecter.'
    );
  }

  return JSON.parse(value);
}


function destroySession_(token) {

  if (!token) return;

  CacheService
    .getScriptCache()
    .remove(
      'SESSION_' + token
    );
}


/* =====================================================
   UTILITAIRE LECTURE DES DONNEES
===================================================== */

function getRows_(sheetName) {

  const sheet =
    getSheet_(sheetName);

  if (!sheet) return [];

  const lastRow =
    sheet.getLastRow();

  const lastColumn =
    sheet.getLastColumn();

  if (
    lastRow < 2 ||
    lastColumn < 1
  ) {

    return [];
  }

  return sheet
    .getRange(
      2,
      1,
      lastRow - 1,
      lastColumn
    )
    .getValues();
}


/* =====================================================
   UTILITAIRE DATE
===================================================== */

function formatDate_(value) {

  if (!value) return '';

  try {

    return Utilities.formatDate(
      new Date(value),
      Session.getScriptTimeZone() ||
        'Africa/Brazzaville',
      'dd/MM/yyyy HH:mm'
    );

  } catch (error) {

    return String(value);
  }
}


/* =====================================================
   CONVERSION OBJET
===================================================== */

function rowToObject_(headers, row) {

  const obj = {};

  headers.forEach(
    function(header, index) {

      obj[header] =
        row[index];

    }
  );

  return obj;
}


/* =====================================================
   INSCRIPTION PARTENAIRE
===================================================== */

function registerPartner(data) {

  setupSystem();

  data =
    data || {};

  const name =
    String(
      data.name || ''
    ).trim();

  const email =
    String(
      data.email || ''
    ).trim()
    .toLowerCase();

  const phone =
    String(
      data.phone || ''
    ).trim();

  const address =
    String(
      data.address || ''
    ).trim();

  const city =
    String(
      data.city || ''
    ).trim();

  const password =
    String(
      data.password || ''
    );

  if (!name)
    throw new Error(
      'Le nom de l’entreprise est obligatoire.'
    );

  if (!email)
    throw new Error(
      'L’adresse email est obligatoire.'
    );

  if (!password || password.length < 6)
    throw new Error(
      'Le mot de passe doit contenir au moins 6 caractères.'
    );


  const users =
    getSheet_(MB.SHEETS.USERS);

  const partners =
    getSheet_(MB.SHEETS.PARTNERS);

  const userData =
    users.getDataRange().getValues();

  for (
    let i = 1;
    i < userData.length;
    i++
  ) {

    const existingEmail =
      String(
        userData[i][2] || ''
      )
      .trim()
      .toLowerCase();

    if (
      existingEmail === email
    ) {

      throw new Error(
        'Cette adresse email possède déjà un compte.'
      );
    }
  }


  const partnerCode =
    generatePartnerCode_();

  const partnerId =
    generateId_('PAR');

  const userId =
    generateId_('USR');

  const now =
    new Date();


  partners.appendRow([

    partnerId,
    name,
    email,
    phone,
    address,
    city,
    partnerCode,
    'EN ATTENTE',
    now,
    now

  ]);


  users.appendRow([

    userId,
    name,
    email,
    phone,

    hashPassword_(
      password
    ),

    'PARTENAIRE',

    partnerCode,

    'EN ATTENTE',

    now,
    now

  ]);


  return {

    success: true,

    message:
      'Votre compte a été créé. Il est maintenant en attente de validation par MUANA BITINDA.',

    partnerCode: partnerCode

  };
}
/* =====================================================
   CONNEXION
===================================================== */

function login(email, password) {

  setupSystem();

  email =
    String(email || '')
      .trim()
      .toLowerCase();

  password =
    String(password || '');

  if (!email || !password) {

    throw new Error(
      'Veuillez renseigner votre email et votre mot de passe.'
    );
  }


  const sheet =
    getSheet_(MB.SHEETS.USERS);

  const data =
    sheet.getDataRange().getValues();

  const passwordHash =
    hashPassword_(password);


  for (
    let i = 1;
    i < data.length;
    i++
  ) {

    const row =
      data[i];

    const rowEmail =
      String(
        row[2] || ''
      )
      .trim()
      .toLowerCase();

    if (
      rowEmail !== email
    ) {

      continue;
    }


    const storedHash =
      String(
        row[4] || ''
      );


    if (
      storedHash !== passwordHash
    ) {

      throw new Error(
        'Email ou mot de passe incorrect.'
      );
    }


    const role =
      String(
        row[5] || ''
      )
      .trim()
      .toUpperCase();


    const status =
      String(
        row[7] || ''
      )
      .trim()
      .toUpperCase();


    if (
      status !== 'ACTIF'
    ) {

      if (
        status === 'EN ATTENTE'
      ) {

        throw new Error(
          'Votre compte est encore en attente de validation par MUANA BITINDA.'
        );
      }

      throw new Error(
        'Votre compte est désactivé.'
      );
    }


    const user = {

      id: row[0],

      name: row[1],

      email: row[2],

      phone: row[3],

      role: role,

      partnerCode: row[6] || '',

      status: status

    };


    const token =
      createSession_(user);


    return {

      success: true,

      token: token,

      user: user

    };

  }


  throw new Error(
    'Email ou mot de passe incorrect.'
  );
}


/* =====================================================
   DECONNEXION
===================================================== */

function logout(token) {

  destroySession_(token);

  return {
    success: true
  };
}


/* =====================================================
   PROFIL UTILISATEUR
===================================================== */

function getProfile(token) {

  const session =
    getSession_(token);

  return {

    success: true,

    user: session

  };
}


/* =====================================================
   CHANGER MOT DE PASSE
===================================================== */

function changePassword(
  token,
  oldPassword,
  newPassword
) {

  const session =
    getSession_(token);

  if (
    !newPassword ||
    String(newPassword).length < 6
  ) {

    throw new Error(
      'Le nouveau mot de passe doit contenir au moins 6 caractères.'
    );
  }


  const sheet =
    getSheet_(MB.SHEETS.USERS);

  const data =
    sheet.getDataRange().getValues();


  for (
    let i = 1;
    i < data.length;
    i++
  ) {

    if (
      String(data[i][0])
      !== String(session.id)
    ) {

      continue;
    }


    if (
      data[i][4]
      !== hashPassword_(
        oldPassword
      )
    ) {

      throw new Error(
        'Ancien mot de passe incorrect.'
      );
    }


    sheet
      .getRange(i + 1, 5)
      .setValue(
        hashPassword_(
          newPassword
        )
      );


    sheet
      .getRange(i + 1, 10)
      .setValue(
        new Date()
      );


    return {

      success: true,

      message:
        'Mot de passe modifié avec succès.'

    };

  }


  throw new Error(
    'Utilisateur introuvable.'
  );
}


/* =====================================================
   VERIFICATION ADMIN
===================================================== */

function requireAdmin_(token) {

  const session =
    getSession_(token);

  if (
    String(session.role)
      .toUpperCase()
      !== 'ADMIN'
  ) {

    throw new Error(
      'Accès administrateur refusé.'
    );
  }

  return session;
}


/* =====================================================
   LISTE DES PARTENAIRES
===================================================== */

function adminGetPartners(token) {

  requireAdmin_(token);

  const sheet =
    getSheet_(MB.SHEETS.PARTNERS);

  const data =
    sheet.getDataRange().getValues();

  const result = [];

  for (
    let i = 1;
    i < data.length;
    i++
  ) {

    if (
      !data[i][0]
    ) continue;

    result.push({

      id: data[i][0],

      name: data[i][1],

      email: data[i][2],

      phone: data[i][3],

      address: data[i][4],

      city: data[i][5],

      code: data[i][6],

      status: data[i][7],

      createdAt:
        formatDate_(data[i][8]),

      updatedAt:
        formatDate_(data[i][9])

    });

  }

  return result;
}


/* =====================================================
   VALIDATION PARTENAIRE
===================================================== */

function adminUpdatePartnerStatus(
  token,
  partnerCode,
  status
) {

  requireAdmin_(token);

  status =
    String(status || '')
      .trim()
      .toUpperCase();

  const allowed = [
    'ACTIF',
    'EN ATTENTE',
    'SUSPENDU'
  ];

  if (
    allowed.indexOf(status)
    === -1
  ) {

    throw new Error(
      'Statut invalide.'
    );
  }


  const partners =
    getSheet_(MB.SHEETS.PARTNERS);

  const users =
    getSheet_(MB.SHEETS.USERS);


  const partnerData =
    partners
      .getDataRange()
      .getValues();


  let found = false;


  for (
    let i = 1;
    i < partnerData.length;
    i++
  ) {

    if (
      String(
        partnerData[i][6]
      )
      === String(partnerCode)
    ) {

      partners
        .getRange(i + 1, 8)
        .setValue(status);

      partners
        .getRange(i + 1, 10)
        .setValue(new Date());

      found = true;

      break;
    }

  }


  if (!found) {

    throw new Error(
      'Partenaire introuvable.'
    );
  }


  const userData =
    users
      .getDataRange()
      .getValues();


  for (
    let i = 1;
    i < userData.length;
    i++
  ) {

    if (
      String(
        userData[i][6]
      )
      === String(partnerCode)
    ) {

      users
        .getRange(i + 1, 8)
        .setValue(status);

      users
        .getRange(i + 1, 10)
        .setValue(new Date());

    }

  }


  return {

    success: true,

    message:
      'Statut du partenaire mis à jour.'

  };
}


/* =====================================================
   PRODUITS D'UN PARTENAIRE
===================================================== */

function getPartnerProducts_(partnerCode) {

  const sheet =
    getSheet_(MB.SHEETS.PRODUCTS);

  if (!sheet) return [];

  const data =
    sheet.getDataRange().getValues();

  const result = [];


  for (
    let i = 1;
    i < data.length;
    i++
  ) {

    const code =
      String(
        data[i][2] || ''
      );


    if (
      code !== String(partnerCode)
    ) {

      continue;
    }


    const productCode =
      String(
        data[i][0] || ''
      );


    const stock =
      calculateStock_(
        partnerCode,
        productCode
      );


    const seuil =
      Number(
        data[i][5] || 0
      );


    let status =
      'DISPONIBLE';


    if (stock <= 0) {

      status =
        'RUPTURE';

    } else if (
      stock <= seuil
    ) {

      status =
        'STOCK FAIBLE';
    }


    result.push({

      code: productCode,

      name: data[i][1],

      partnerCode: code,

      price:
        Number(data[i][3] || 0),

      initialStock:
        Number(data[i][4] || 0),

      alertThreshold:
        seuil,

      stock:
        stock,

      status:
        status

    });

  }


  return result;
}


/* =====================================================
   CALCUL DU STOCK
===================================================== */

function calculateStock_(
  partnerCode,
  productCode
) {

  const products =
    getSheet_(MB.SHEETS.PRODUCTS);

  let initialStock = 0;


  if (products) {

    const data =
      products
        .getDataRange()
        .getValues();


    for (
      let i = 1;
      i < data.length;
      i++
    ) {

      if (
        String(data[i][0])
        === String(productCode)
        &&
        String(data[i][2])
        === String(partnerCode)
      ) {

        initialStock =
          Number(data[i][4] || 0);

        break;
      }

    }

  }


  const movements =
    getSheet_(MB.SHEETS.MOVEMENTS);

  if (!movements) {

    return initialStock;
  }


  const data =
    movements
      .getDataRange()
      .getValues();


  let totalIn = 0;

  let totalOut = 0;


  for (
    let i = 1;
    i < data.length;
    i++
  ) {

    if (
      String(data[i][2])
      !== String(partnerCode)
    ) continue;


    if (
      String(data[i][3])
      !== String(productCode)
    ) continue;


    totalIn +=
      Number(data[i][5] || 0);


    totalOut +=
      Number(data[i][6] || 0);

  }


  return (
    initialStock +
    totalIn -
    totalOut
  );
}


/* =====================================================
   TABLEAU DE BORD PARTENAIRE
===================================================== */

function getDashboard(token) {

  const session =
    getSession_(token);


  if (
    session.role === 'ADMIN'
  ) {

    return getAdminDashboard_();
  }


  const partnerCode =
    session.partnerCode;


  const products =
    getPartnerProducts_(
      partnerCode
    );


  let totalStock = 0;

  let lowStock = 0;

  let productsCount =
    products.length;


  products.forEach(
    function(product) {

      totalStock +=
        Number(product.stock || 0);

      if (
        product.status
        === 'STOCK FAIBLE'
      ) {

        lowStock++;

      }

    }
  );


  const movements =
    getPartnerMovements_(
      partnerCode
    );


  const deliveries =
    getPartnerDeliveries_(
      partnerCode
    );


  const receptions =
    getPartnerReceptions_(
      partnerCode
    );


  const evacuations =
    getPartnerEvacuations_(
      partnerCode
    );


  return {

    success: true,

    role: 'PARTENAIRE',

    partnerCode:
      partnerCode,

    stats: {

      totalStock:
        totalStock,

      products:
        productsCount,

      lowStock:
        lowStock,

      movements:
        movements.length,

      deliveries:
        deliveries.length,

      receptions:
        receptions.length,

      evacuations:
        evacuations.length

    },

    products:
      products,

    recentMovements:
      movements.slice(0, 10),

    recentDeliveries:
      deliveries.slice(0, 10)

  };
}
/* =====================================================
   MOUVEMENTS PARTENAIRE
===================================================== */

function getPartnerMovements_(
  partnerCode
) {

  const sheet =
    getSheet_(MB.SHEETS.MOVEMENTS);

  if (!sheet) return [];

  const data =
    sheet.getDataRange().getValues();

  const result = [];


  for (
    let i = data.length - 1;
    i >= 1;
    i--
  ) {

    if (
      String(data[i][2])
      !== String(partnerCode)
    ) {

      continue;
    }


    result.push({

      id: data[i][0],

      date:
        formatDate_(data[i][1]),

      partnerCode:
        data[i][2],

      productCode:
        data[i][3],

      type:
        data[i][4],

      entry:
        Number(data[i][5] || 0),

      exit:
        Number(data[i][6] || 0),

      quantity:
        Number(data[i][7] || 0),

      reason:
        data[i][8],

      amount:
        Number(data[i][9] || 0),

      reference:
        data[i][10],

      destination:
        data[i][11],

      comment:
        data[i][12]

    });

  }


  return result;
}


/* =====================================================
   LIVRAISONS PARTENAIRE
===================================================== */

function getPartnerDeliveries_(
  partnerCode
) {

  const sheet =
    getSheet_(MB.SHEETS.DELIVERIES);

  if (!sheet) return [];

  const data =
    sheet.getDataRange().getValues();

  const result = [];


  for (
    let i = data.length - 1;
    i >= 1;
    i--
  ) {

    if (
      String(data[i][2])
      !== String(partnerCode)
    ) {

      continue;
    }


    result.push({

      id: data[i][0],

      date:
        formatDate_(data[i][1]),

      partnerCode:
        data[i][2],

      productCode:
        data[i][3],

      order:
        data[i][4],

      quantity:
        Number(data[i][5] || 0),

      client:
        data[i][6],

      phone:
        data[i][7],

      address:
        data[i][8],

      productAmount:
        Number(data[i][9] || 0),

      deliveryFee:
        Number(data[i][10] || 0),

      driver:
        data[i][11],

      status:
        data[i][12],

      reference:
        data[i][13],

      comment:
        data[i][14]

    });

  }


  return result;
}


/* =====================================================
   RECEPTIONS PARTENAIRE
===================================================== */

function getPartnerReceptions_(
  partnerCode
) {

  const sheet =
    getSheet_(MB.SHEETS.RECEIPTS);

  if (!sheet) return [];

  const data =
    sheet.getDataRange().getValues();

  const result = [];


  for (
    let i = data.length - 1;
    i >= 1;
    i--
  ) {

    if (
      String(data[i][2])
      !== String(partnerCode)
    ) {

      continue;
    }


    result.push({

      id: data[i][0],

      date:
        formatDate_(data[i][1]),

      partnerCode:
        data[i][2],

      productCode:
        data[i][3],

      quantity:
        Number(data[i][4] || 0),

      unitPrice:
        Number(data[i][5] || 0),

      total:
        Number(data[i][6] || 0),

      reference:
        data[i][7],

      receivedBy:
        data[i][8],

      status:
        data[i][9],

      comment:
        data[i][10]

    });

  }


  return result;
}


/* =====================================================
   EVACUATIONS PARTENAIRE
===================================================== */

function getPartnerEvacuations_(
  partnerCode
) {

  const sheet =
    getSheet_(MB.SHEETS.EVACUATIONS);

  if (!sheet) return [];

  const data =
    sheet.getDataRange().getValues();

  const result = [];


  for (
    let i = data.length - 1;
    i >= 1;
    i--
  ) {

    if (
      String(data[i][2])
      !== String(partnerCode)
    ) {

      continue;
    }


    result.push({

      id: data[i][0],

      date:
        formatDate_(data[i][1]),

      partnerCode:
        data[i][2],

      productCode:
        data[i][3],

      quantity:
        Number(data[i][4] || 0),

      reason:
        data[i][5],

      amount:
        Number(data[i][6] || 0),

      reference:
        data[i][7],

      validatedBy:
        data[i][8],

      status:
        data[i][9],

      comment:
        data[i][10]

    });

  }


  return result;
}


/* =====================================================
   DONNEES PARTENAIRE
===================================================== */

function getPartnerData(token) {

  const session =
    getSession_(token);


  if (
    !session.partnerCode
  ) {

    throw new Error(
      'Ce compte n’est pas associé à un partenaire.'
    );
  }


  const partnerCode =
    session.partnerCode;


  return {

    success: true,

    partner: {

      code:
        partnerCode,

      name:
        session.name,

      email:
        session.email

    },

    products:
      getPartnerProducts_(
        partnerCode
      ),

    movements:
      getPartnerMovements_(
        partnerCode
      ),

    deliveries:
      getPartnerDeliveries_(
        partnerCode
      ),

    receptions:
      getPartnerReceptions_(
        partnerCode
      ),

    evacuations:
      getPartnerEvacuations_(
        partnerCode
      )

  };
}


/* =====================================================
   AJOUT PRODUIT
===================================================== */

function addProduct(
  token,
  product
) {

  const session =
    getSession_(token);


  let partnerCode =
    session.partnerCode;


  if (
    session.role === 'ADMIN'
    &&
    product.partnerCode
  ) {

    partnerCode =
      product.partnerCode;

  }


  if (!partnerCode) {

    throw new Error(
      'Partenaire non identifié.'
    );
  }


  const code =
    String(
      product.code || ''
    ).trim();

  const name =
    String(
      product.name || ''
    ).trim();


  if (!code || !name) {

    throw new Error(
      'Le code et le nom du produit sont obligatoires.'
    );
  }


  const sheet =
    getSheet_(MB.SHEETS.PRODUCTS);

  const data =
    sheet.getDataRange().getValues();


  for (
    let i = 1;
    i < data.length;
    i++
  ) {

    if (
      String(data[i][0])
      === code
      &&
      String(data[i][2])
      === partnerCode
    ) {

      throw new Error(
        'Ce produit existe déjà pour ce partenaire.'
      );
    }

  }


  const now =
    new Date();


  sheet.appendRow([

    code,

    name,

    partnerCode,

    Number(
      product.price || 0
    ),

    Number(
      product.initialStock || 0
    ),

    Number(
      product.threshold || 10
    ),

    Number(
      product.initialStock || 0
    ),

    'DISPONIBLE',

    now,

    now

  ]);


  return {

    success: true,

    message:
      'Produit ajouté avec succès.'

  };
}


/* =====================================================
   AJOUT RECEPTION
===================================================== */

function addReception(
  token,
  data
) {

  const session =
    getSession_(token);


  const partnerCode =
    session.role === 'ADMIN'
      ? String(
          data.partnerCode || ''
        )
      : session.partnerCode;


  if (!partnerCode) {

    throw new Error(
      'Partenaire obligatoire.'
    );
  }


  const productCode =
    String(
      data.productCode || ''
    ).trim();


  const quantity =
    Number(
      data.quantity || 0
    );


  if (
    !productCode ||
    quantity <= 0
  ) {

    throw new Error(
      'Produit et quantité obligatoires.'
    );
  }


  const products =
    getPartnerProducts_(
      partnerCode
    );


  const product =
    products.find(
      function(item) {

        return (
          String(item.code)
          === productCode
        );

      }
    );


  if (!product) {

    throw new Error(
      'Produit introuvable pour ce partenaire.'
    );
  }


  const now =
    new Date();

  const reference =
    String(
      data.reference || ''
    );


  const total =
    quantity *
    Number(
      data.unitPrice ||
      product.price ||
      0
    );


  const receipts =
    getSheet_(
      MB.SHEETS.RECEIPTS
    );


  receipts.appendRow([

    generateId_('REC'),

    now,

    partnerCode,

    productCode,

    quantity,

    Number(
      data.unitPrice ||
      product.price ||
      0
    ),

    total,

    reference,

    session.name,

    'VALIDÉ',

    String(
      data.comment || ''
    )

  ]);


  addMovement_({

    partnerCode:
      partnerCode,

    productCode:
      productCode,

    type:
      'ENTRÉE',

    entry:
      quantity,

    exit:
      0,

    quantity:
      quantity,

    reason:
      'RÉCEPTION',

    amount:
      total,

    reference:
      reference,

    destination:
      '',

    comment:
      String(
        data.comment || ''
      )

  });


  return {

    success: true,

    message:
      'Réception enregistrée avec succès.'

  };
}


/* =====================================================
   AJOUT MOUVEMENT
===================================================== */

function addMovement_(data) {

  const sheet =
    getSheet_(MB.SHEETS.MOVEMENTS);

  sheet.appendRow([

    generateId_('MOV'),

    new Date(),

    data.partnerCode,

    data.productCode,

    data.type,

    Number(data.entry || 0),

    Number(data.exit || 0),

    Number(data.quantity || 0),

    data.reason || '',

    Number(data.amount || 0),

    data.reference || '',

    data.destination || '',

    data.comment || ''

  ]);
}


/* =====================================================
   AJOUT EVACUATION
===================================================== */

function addEvacuation(
  token,
  data
) {

  const session =
    getSession_(token);


  const partnerCode =
    session.role === 'ADMIN'
      ? String(
          data.partnerCode || ''
        )
      : session.partnerCode;


  const productCode =
    String(
      data.productCode || ''
    ).trim();


  const quantity =
    Number(
      data.quantity || 0
    );


  if (
    !productCode ||
    quantity <= 0
  ) {

    throw new Error(
      'Produit et quantité obligatoires.'
    );
  }


  const stock =
    calculateStock_(
      partnerCode,
      productCode
    );


  if (
    quantity > stock
  ) {

    throw new Error(
      'Stock insuffisant. Stock disponible : ' +
      stock
    );
  }


  const amount =
    Number(
      data.amount || 0
    );


  const reference =
    String(
      data.reference || ''
    );


  const evacuations =
    getSheet_(
      MB.SHEETS.EVACUATIONS
    );


  evacuations.appendRow([

    generateId_('EVA'),

    new Date(),

    partnerCode,

    productCode,

    quantity,

    String(
      data.reason ||
      'ÉVACUATION'
    ),

    amount,

    reference,

    session.name,

    'VALIDÉ',

    String(
      data.comment || ''
    )

  ]);


  addMovement_({

    partnerCode:
      partnerCode,

    productCode:
      productCode,

    type:
      'SORTIE',

    entry:
      0,

    exit:
      quantity,

    quantity:
      quantity,

    reason:
      data.reason ||
      'ÉVACUATION',

    amount:
      amount,

    reference:
      reference,

    destination:
      data.destination ||
      '',

    comment:
      data.comment ||
      ''

  });


  return {

    success: true,

    message:
      'Évacuation enregistrée avec succès.'

  };
}
/* =====================================================
   ADMIN DASHBOARD
===================================================== */

function getAdminDashboard_() {

  const partners =
    getRows_(
      MB.SHEETS.PARTNERS
    );

  const products =
    getRows_(
      MB.SHEETS.PRODUCTS
    );

  const movements =
    getRows_(
      MB.SHEETS.MOVEMENTS
    );

  const deliveries =
    getRows_(
      MB.SHEETS.DELIVERIES
    );

  let activePartners = 0;
  let pendingPartners = 0;

  partners.forEach(
    function(row) {

      const status =
        String(
          row[7] || ''
        )
        .toUpperCase();

      if (
        status === 'ACTIF'
      ) {

        activePartners++;

      }

      if (
        status === 'EN ATTENTE'
      ) {

        pendingPartners++;

      }

    }
  );


  let totalStock = 0;

  products.forEach(
    function(row) {

      totalStock +=
        calculateStock_(
          row[2],
          row[0]
        );

    }
  );


  return {

    success: true,

    role: 'ADMIN',

    stats: {

      partners:
        partners.length,

      activePartners:
        activePartners,

      pendingPartners:
        pendingPartners,

      products:
        products.length,

      movements:
        movements.length,

      deliveries:
        deliveries.length,

      totalStock:
        totalStock

    }

  };
}


/* =====================================================
   ADMIN : LISTE DES PRODUITS
===================================================== */

function adminGetProducts(
  token
) {

  requireAdmin_(token);

  const sheet =
    getSheet_(MB.SHEETS.PRODUCTS);

  const data =
    sheet.getDataRange().getValues();

  const result = [];


  for (
    let i = 1;
    i < data.length;
    i++
  ) {

    if (!data[i][0])
      continue;


    result.push({

      code:
        data[i][0],

      name:
        data[i][1],

      partnerCode:
        data[i][2],

      price:
        Number(data[i][3] || 0),

      initialStock:
        Number(data[i][4] || 0),

      threshold:
        Number(data[i][5] || 0),

      stock:
        calculateStock_(
          data[i][2],
          data[i][0]
        ),

      status:
        data[i][7]

    });

  }


  return result;
}


/* =====================================================
   ADMIN : AJOUT LIVRAISON
===================================================== */

function addDelivery(
  token,
  data
) {

  const session =
    getSession_(token);


  const partnerCode =
    session.role === 'ADMIN'
      ? String(
          data.partnerCode || ''
        )
      : session.partnerCode;


  const productCode =
    String(
      data.productCode || ''
    ).trim();


  const quantity =
    Number(
      data.quantity || 0
    );


  if (
    !partnerCode ||
    !productCode ||
    quantity <= 0
  ) {

    throw new Error(
      'Partenaire, produit et quantité sont obligatoires.'
    );
  }


  const stock =
    calculateStock_(
      partnerCode,
      productCode
    );


  if (
    quantity > stock
  ) {

    throw new Error(
      'Stock insuffisant. Disponible : ' +
      stock
    );
  }


  const deliveries =
    getSheet_(
      MB.SHEETS.DELIVERIES
    );


  const reference =
    String(
      data.reference || ''
    );


  const productAmount =
    Number(
      data.productAmount || 0
    );


  const deliveryFee =
    Number(
      data.deliveryFee || 0
    );


  deliveries.appendRow([

    generateId_('LIV'),

    new Date(),

    partnerCode,

    productCode,

    String(
      data.order || ''
    ),

    quantity,

    String(
      data.client || ''
    ),

    String(
      data.phone || ''
    ),

    String(
      data.address || ''
    ),

    productAmount,

    deliveryFee,

    String(
      data.driver || ''
    ),

    String(
      data.status ||
      'EN ATTENTE'
    ),

    reference,

    String(
      data.comment || ''
    )

  ]);


  addMovement_({

    partnerCode:
      partnerCode,

    productCode:
      productCode,

    type:
      'SORTIE',

    entry:
      0,

    exit:
      quantity,

    quantity:
      quantity,

    reason:
      'LIVRAISON',

    amount:
      productAmount,

    reference:
      reference,

    destination:
      data.address || '',

    comment:
      data.comment || ''

  });


  return {

    success: true,

    message:
      'Livraison enregistrée avec succès.'

  };
}


/* =====================================================
   INITIALISATION MANUELLE
===================================================== */

function initialiserMuanaBitinda() {

  return setupSystem();
}
