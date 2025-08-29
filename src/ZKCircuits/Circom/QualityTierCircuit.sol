pragma circom 2.0.0;

template QualityTierCircuit() {
    // Private inputs (what you want to hide)
    signal input cuppingScores[5];     // Array of cupping scores
    signal input defectCount;          // Number of defects
    signal input moistureContent;      // Moisture percentage
    signal input altitude;             // Altitude in meters
    
    // Public inputs (what competitors see)
    signal input qualityTier;          // 'premium', 'standard', 'value'
    signal input minScore;             // Minimum score for tier
    signal input meetsTierRequirements; // Boolean
    
    // Outputs
    signal output qualityVerified;
    signal output tierConfirmed;
    
    // Calculate weighted quality score
    component scoreCalculator = QualityScoreCalculator();
    scoreCalculator.cuppingScores <== cuppingScores;
    scoreCalculator.defectCount <== defectCount;
    scoreCalculator.moistureContent <== moistureContent;
    scoreCalculator.altitude <== altitude;
    
    // Verify quality meets tier requirements
    component tierCheck = GreaterThan(32);
    tierCheck.in[0] <== scoreCalculator.out;
    tierCheck.in[1] <== minScore;
    
    qualityVerified <== tierCheck.out;
    tierConfirmed <== meetsTierRequirements;
    
    // Verify that the proof is consistent with public inputs
    qualityVerified === meetsTierRequirements;
}

// Quality score calculation template
template QualityScoreCalculator() {
    signal input cuppingScores[5];
    signal input defectCount;
    signal input moistureContent;
    signal input altitude;
    signal output out;
    
    // Weighted scoring algorithm
    var cuppingWeight = 0.6;    // 60% weight for cupping scores
    var defectWeight = 0.2;     // 20% weight for defect count
    var moistureWeight = 0.1;   // 10% weight for moisture
    var altitudeWeight = 0.1;   // 10% weight for altitude
    
    // Calculate weighted cupping score
    var cuppingSum = 0;
    for (var i = 0; i < 5; i++) {
        cuppingSum += cuppingScores[i];
    }
    var avgCuppingScore = cuppingSum / 5;
    
    // Calculate weighted defect score (inverse - fewer defects = higher score)
    var defectScore = 100 - defectCount * 2; // Each defect reduces score by 2
    
    // Calculate weighted moisture score (optimal range 10-12%)
    var moistureScore = 100;
    if (moistureContent < 10 || moistureContent > 12) {
        moistureScore = 80; // Penalty for non-optimal moisture
    }
    
    // Calculate weighted altitude score (higher altitude = higher score)
    var altitudeScore = 80;
    if (altitude > 1500) {
        altitudeScore = 100; // Premium altitude
    } else if (altitude > 1000) {
        altitudeScore = 90;  // Good altitude
    }
    
    // Calculate final weighted score
    out <== (avgCuppingScore * cuppingWeight) +
            (defectScore * defectWeight) +
            (moistureScore * moistureWeight) +
            (altitudeScore * altitudeWeight);
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
