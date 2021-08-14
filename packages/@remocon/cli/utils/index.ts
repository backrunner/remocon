import os from 'os';

export const getIpList = () => {
  const ipList: string[] = [];
  const ifaces = os.networkInterfaces();
  Object.keys(ifaces).forEach((ifname) => {

    const iface = ifaces[ifname];
    if (!iface) {
      return;
    }
    iface.forEach((ifaceItem) => {
      if (ifaceItem.family === 'IPv4') {
        ipList.push(ifaceItem.address);
      }
    });
  });
  const index = ipList.indexOf('127.0.0.1');
  if (index !== -1) {
    ipList.splice(index, 1);
  }
  ipList.unshift('127.0.0.1');
  return ipList;
};
