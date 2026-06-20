export const EXAMPLES = {
  LOOP: {
    addition: `// Addition zweier Register: x0 := x1 + x2
x0 := x1;

LOOP x2 DO
  x0 := x0 + 1
END`,
    multiplication: `// Multiplikation zweier Register: x0 := x1 * x2
x0 := 0;

LOOP x2 DO
  LOOP x1 DO
    x0 := x0 + 1
  END
END`,
    exponentiation: `// Exponentiation zweier Register: x0 := x1 ^ x2
x0 := 1;

LOOP x2 DO
  x_temp := 0;
  LOOP x0 DO
    LOOP x1 DO
      x_temp := x_temp + 1
    END
  END;
  x0 := x_temp
END`,
    predecessor: `// Vorgänger (Predecessor): x0 := x1 - 1
x0 := 0;
x_prev := 0;

LOOP x1 DO
  x0 := x_prev;
  x_prev := x_prev + 1
END`,
    conditional: `// Bedingte Zuweisung: IF x1 > 0 THEN x0 := x2
x0 := 0;

LOOP x1 DO
  x0 := x2
END`
  },
  WHILE: {
    addition: `// Addition mit WHILE: x0 := x1 + x2
x0 := x1;
x_counter := x2;

WHILE x_counter DO
  x0 := x0 + 1;
  x_counter := x_counter -· 1
END`,
    multiplication: `// Multiplikation mit WHILE: x0 := x1 * x2
x0 := 0;
x_counter := x2;

WHILE x_counter DO
  x_add := x1;
  WHILE x_add DO
    x0 := x0 + 1;
    x_add := x_add -· 1
  END;
  x_counter := x_counter -· 1
END`,
    parity: `// Parität (Modulo 2) mit WHILE: x0 := x1 mod 2
x_temp := x1;
x0 := 0; // 0 = gerade, 1 = ungerade

WHILE x_temp DO
  // Invertiere x0 in jedem Schritt
  x_is_one := 0;
  x_test := x0;
  WHILE x_test DO
    x_is_one := 1;
    x_test := 0
  END;
  
  x_is_zero := 1 -· x_is_one;
  
  x0 := 0;
  WHILE x_is_zero DO
    x0 := 1;
    x_is_zero := 0
  END;
  
  x_temp := x_temp -· 1
END`
  },
  GOTO: {
    addition: `// Addition mit GOTO: x0 := x1 + x2
M0: x0 := x1;
M1: x_temp := x2;
M2: IF x_temp = 0 GOTO M6;
M3: x0 := x0 + 1;
M4: x_temp := x_temp -· 1;
M5: GOTO M2;
M6: x0 := x0 + 0`,
    multiplication: `// Multiplikation mit GOTO: x0 := x1 * x2
M0: x0 := 0;
M1: x_c2 := x2;
M2: IF x_c2 = 0 GOTO M9;
M3: x_c1 := x1;
M4: IF x_c1 = 0 GOTO M8;
M5: x0 := x0 + 1;
M6: x_c1 := x_c1 -· 1;
M7: GOTO M4;
M8: x_c2 := x_c2 -· 1;
M85: GOTO M2;
M9: x0 := x0 + 0`,
    subtraction: `// Monus-Subtraktion mit GOTO: x0 := x1 -· x2
M0: x0 := x1;
M1: x_temp := x2;
M2: IF x_temp = 0 GOTO M6;
M3: x0 := x0 -· 1;
M4: x_temp := x_temp -· 1;
M5: GOTO M2;
M6: x0 := x0 + 0`
  }
};
