const io = require('socket.io-client');
const logger = require('./logs/logger');

let meta = {};

logger.openLog('client.log');
function startMasterConnection(url) {
  const socket = io(url);

  socket.on('connect', () => {
    logger.log('connecting to master');
    handleGetMeta(socket);
  });

  return socket;
}

const masterSocket = startMasterConnection(process.env.MASTER_TO_CLIENT);

const handleGetMeta = (socket) => {
  socket.on('get-meta', (newMeta) => {
    meta = newMeta;
    logger.log('meta data recieved');
  });
};

const getServerSocket = (region) => {
  let url = 0;

  Object.values(meta).forEach((v) => {
    v.regions.forEach((r) => {
      if (r === region) url = v.url;
    });
  });

  const serverSocket = io(url);
  logger.log('connecting to server');

  serverSocket.on('done', () => {
    logger.log('connection closed');

    serverSocket.close();
  });

  serverSocket.on('sendingRows', (tracks) => {
    console.log(tracks);
    logger.log('receiving rows data');

    // close socket
    serverSocket.close();
  });

  return serverSocket;
};

async function test1() {
  // addRow
  logger.log('Adding a row');

  const req = {
    row: {
      Region: 'fr',
    },
    object: {
      Name: 'walid',
      Data: '1/7/2021',
      Artist: 'HBO',
      URL: 'https://youtube.com',
      Streams: '19270',
      Position: 2,
      Region: 'fr',
    },
  };

  // get serverSocket
  const serverSocket = getServerSocket(req.row.Region);

  serverSocket.emit('addRow', req);
}

async function test2() {
  logger.log('deleting a row');

  // deleteRow
  //TODO: convert to array of row keys
  const req = {
    row: {
      Region: 'it',
      ID: 11,
    },
  };

  // get serverSocket
  const serverSocket = getServerSocket(req.row.Region);

  serverSocket.emit('delete', req);
}

async function test3() {
  logger.log('reading rows');

  // readRows
  const req = [
    {
      Region: 'it',
      ID: 2,
    },
    {
      Region: 'ec',
      ID: 21,
    },
  ];

  // get serverSocket
  const serverSocket = getServerSocket(req[0].Region);

  serverSocket.emit('readRows', req);
}

async function test4() {
  logger.log('deleting cells from a row');

  // deletecells
  const req = {
    row: {
      Region: 'fr',
      ID: 3,
    },
    cells: ['URL', 'Name'],
  };

  // get serverSocket
  const serverSocket = getServerSocket(req.row.Region);

  serverSocket.emit('deleteCells', req);
}

setTimeout(() => {
  test1();
  test1();
}, 1000);

setTimeout(() => {
  test2();
}, 2000);

setTimeout(() => {
  test3();
}, 3000);

setTimeout(() => {
  test4();
}, 1000);
