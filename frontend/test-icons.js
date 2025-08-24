// Test file to check available icons
try {
  const { SiChainlink, SiIpfs } = require('react-icons/si');
  console.log('SiChainlink available:', !!SiChainlink);
  console.log('SiIpfs available:', !!SiIpfs);
} catch (e) {
  console.log('Error loading Simple Icons:', e.message);
}

try {
  const si = require('react-icons/si');
  const chainlinkIcons = Object.keys(si).filter(k => k.toLowerCase().includes('chain'));
  const ipfsIcons = Object.keys(si).filter(k => k.toLowerCase().includes('ipfs'));
  console.log('Chainlink icons:', chainlinkIcons);
  console.log('IPFS icons:', ipfsIcons);
} catch (e) {
  console.log('Error:', e.message);
}
