pragma circom 2.0.0;

// [assignment] Modify the circuit below to perform a multiplication of three signals

template Multiplier3 () {  

   // Declaration of signals.  
   signal input a;  
   signal input b;
   signal input c;
   signal k;
   signal output d;  

   // Constraints. 
   k <== a * b; 
   d <== k * c;  
}

component main = Multiplier3();