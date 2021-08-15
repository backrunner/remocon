import envPaths from 'env-paths';
import path from 'path';
import fs from 'fs';
import forge from 'node-forge';

const certDirPath = path.resolve(
  envPaths('remocon', {
    suffix: '',
  }).data,
  './certs',
);
const certPath = {
  key: path.resolve(certDirPath, './root.key'),
  cert: path.resolve(certDirPath, './root.crt'),
};

const getRandom = () => {
  const random = Math.floor(Math.random() * 1000);
  if (random < 10) {
    return `00${random}`;
  }
  if (random < 100) {
    return `0${random}`;
  }
  return `${random}`;
};

const createCert = (publicKey: forge.pki.PublicKey, serialNumber?: string) => {
  const cert = forge.pki.createCertificate();
  cert.publicKey = publicKey;
  cert.serialNumber = serialNumber || '01';
  const curYear = new Date().getFullYear();
  cert.validity.notBefore = new Date();
  cert.validity.notAfter = new Date();
  cert.validity.notBefore.setFullYear(curYear - 1);
  cert.validity.notAfter.setFullYear(curYear + 10);
  return cert;
};

const createRootCA = () => {
  const keys = forge.pki.rsa.generateKeyPair(2048);
  const cert = createCert(keys.publicKey);
  const now = `${Date.now()}${getRandom()}`;
  const attrs: forge.pki.CertificateField[] = [
    {
      name: 'commonName',
      value: `remocon.${now}`,
    },
    {
      name: 'countryName',
      value: 'CN',
    },
    {
      shortName: 'ST',
      value: 'GuangDong',
    },
    {
      name: 'localityName',
      value: 'ShenZhen',
    },
    {
      name: 'organizationName',
      value: `${now}.remocon.org`,
    },
    {
      shortName: 'OU',
      value: 'remocon.org',
    },
  ];
  cert.setSubject(attrs);
  cert.setIssuer(attrs);
  cert.setExtensions([
    {
      name: 'basicConstraints',
      cA: true,
    },
    {
      name: 'keyUsage',
      keyCertSign: true,
      digitalSignature: true,
      nonRepudiation: true,
      keyEncipherment: true,
      dataEncipherment: true,
    },
    {
      name: 'extKeyUsage',
      serverAuth: true,
      clientAuth: true,
      codeSigning: true,
      emailProtection: true,
      timeStamping: true,
    },
    {
      name: 'nsCertType',
      client: true,
      server: true,
      email: true,
      objsign: true,
      sslCA: true,
      emailCA: true,
      objCA: true,
    },
  ]);
  cert.sign(keys.privateKey, forge.md.sha256.create());

  return {
    key: keys.privateKey,
    cert,
  };
};

export const getHttpsCerts = () => {
  if (!fs.existsSync(certDirPath)) {
    fs.mkdirSync(certDirPath, { recursive: true });
  }
  // check certs
  if (fs.existsSync(certPath.cert) && fs.existsSync(certPath.key)) {
    return {
      cert: fs.readFileSync(certPath.cert, { encoding: 'utf-8' }),
      key: fs.readFileSync(certPath.key, { encoding: 'utf-8' }),
    };
  } else {
    // generate root ca cert
    const rootCA = createRootCA();
    const rootCACert = forge.pki.certificateToPem(rootCA.cert).toString();
    const rootCAKey = forge.pki.privateKeyToPem(rootCA.key).toString();
    fs.writeFileSync(certPath.cert, rootCACert, { encoding: 'utf-8' });
    fs.writeFileSync(certPath.key, rootCAKey, { encoding: 'utf-8' });
    return {
      cert: rootCACert,
      key: rootCAKey,
    };
  }
};

export const cleanHttpsCerts = () => {
  if (fs.existsSync(certPath.cert)) {
    fs.unlinkSync(certPath.cert);
  }
  if (fs.existsSync(certPath.key)) {
    fs.unlinkSync(certPath.key);
  }
};
