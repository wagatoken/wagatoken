pragma circom 2.0.0;

template PricePrivacyCircuit() {
    // Private inputs (what you want to hide)
    signal input exactPrice;           // Exact price in cents
    signal input competitorPrices[5];  // Array of competitor prices
    
    // Public inputs (what competitors see)
    signal input marketSegment;        // 'premium', 'mid-market', 'value'
    signal input priceRange;           // Min/max price range
    signal input isCompetitive;        // Boolean: is price competitive?
    
    // Outputs
    signal output priceCompetitive;
    signal output marketPosition;
    
    // Circuit logic
    component priceRangeCheck = GreaterThan(32);
    priceRangeCheck.in[0] <== exactPrice;
    priceRangeCheck.in[1] <== priceRange;
    
    // Verify price is within competitive range
    priceCompetitive <== priceRangeCheck.out;
    
    // Determine market position without revealing exact price
    // Use multiplication instead of ternary: marketPosition = isCompetitive * 1
    marketPosition <== isCompetitive;
    
    // Verify that the proof is consistent with public inputs
    priceCompetitive === isCompetitive;
}

// Helper template for greater than comparison
template GreaterThan(n) {
    signal input in[2];
    signal output out;
    
    component n2b = Num2Bits(n+1);
    n2b.in <== in[0] - in[1] + (1<<n);
    out <== 1 - n2b.out[n];
}

// Helper template for number to bits conversion
template Num2Bits(n) {
    signal input in;
    signal output out[n];
    var lc1=0;
    var e2=1;
    for (var i = 0; i<n; i++) {
        out[i] <-- (in >> i) & 1;
        out[i] * (out[i] -1 ) === 0;
        lc1 += out[i] * e2;
        e2 = e2 + e2;
    }
    lc1 === in;
}

// Main component - this is what gets compiled
component main { public [marketSegment, priceRange, isCompetitive] } = PricePrivacyCircuit();
