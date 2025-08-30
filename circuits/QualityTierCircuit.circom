pragma circom 2.0.0;

template QualityTierCircuit() {
    // Private inputs (what you want to hide)
    signal input cuppingScore;         // Single cupping score
    signal input defectCount;          // Number of defects
    signal input moistureContent;      // Moisture percentage
    
    // Public inputs (what competitors see)
    signal input qualityTier;          // 'premium', 'standard', 'value'
    signal input minScore;             // Minimum score for tier
    signal input meetsTierRequirements; // Boolean
    
    // Outputs
    signal output qualityVerified;
    signal output tierConfirmed;
    
    // Verify quality meets tier requirements
    component tierCheck = GreaterThan(32);
    tierCheck.in[0] <== cuppingScore;
    tierCheck.in[1] <== minScore;
    
    qualityVerified <== tierCheck.out;
    tierConfirmed <== meetsTierRequirements;
    
    // Verify that the proof is consistent with public inputs
    qualityVerified === meetsTierRequirements;
    
    // Additional constraints for quality verification
    defectCount * (defectCount - 1) === 0; // defectCount must be 0 or 1
    moistureContent * (moistureContent - 1) === 0; // moistureContent must be 0 or 1
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
component main { public [qualityTier, minScore, meetsTierRequirements] } = QualityTierCircuit();
