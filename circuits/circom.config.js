module.exports = {
  // Circuits to compile
  circuits: [
    {
      name: "PricePrivacyCircuit",
      path: "./PricePrivacyCircuit.circom",
      output: "./build/PricePrivacyCircuit"
    },
    {
      name: "QualityTierCircuit", 
      path: "./QualityTierCircuit.circom",
      output: "./build/QualityTierCircuit"
    },
    {
      name: "SupplyChainPrivacyCircuit",
      path: "./SupplyChainPrivacyCircuit.circom", 
      output: "./build/SupplyChainPrivacyCircuit"
    }
  ],
  
  // Compiler settings
  compiler: {
    version: "2.1.4",
    options: {
      c: true,           // Generate C++ code
      wasm: true,        // Generate WebAssembly
      r1cs: true,        // Generate R1CS constraint system
      sym: true,         // Generate symbol table
      json: true,        // Generate JSON output
      prime: "bn128"     // Use BN128 curve (compatible with Ethereum)
    }
  },
  
  // Output directories
  output: {
    build: "./build",
    artifacts: "./artifacts"
  }
};
