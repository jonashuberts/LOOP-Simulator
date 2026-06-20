// Lexer / Tokenizer
export function tokenize(code) {
  const tokens = [];
  const lines = code.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const lineText = lines[i];
    const lineNum = i + 1;
    let cursor = 0;
    
    while (cursor < lineText.length) {
      const char = lineText[cursor];
      
      // Skip whitespace
      if (/\s/.test(char)) {
        cursor++;
        continue;
      }
      
      // Skip comments
      if (lineText.substring(cursor, cursor + 2) === '//') {
        break;
      }
      
      // Semicolons
      if (char === ';') {
        tokens.push({ type: 'SEMICOLON', value: ';', line: lineNum });
        cursor++;
        continue;
      }
      
      // Zuweisung :=
      if (lineText.substring(cursor, cursor + 2) === ':=') {
        tokens.push({ type: 'ASSIGN', value: ':=', line: lineNum });
        cursor += 2;
        continue;
      }
      
      // Colon :
      if (char === ':') {
        tokens.push({ type: 'COLON', value: ':', line: lineNum });
        cursor++;
        continue;
      }
      
      // Equals =
      if (char === '=') {
        tokens.push({ type: 'EQUALS', value: '=', line: lineNum });
        cursor++;
        continue;
      }
      
      // Monus Subtraction check (-·, −·, -•, -*, -., etc.)
      const monusMatch = lineText.substring(cursor).match(/^(?:-|−)(?:·|•|\*|\.|dot)/);
      if (monusMatch) {
        tokens.push({ type: 'OPERATOR', value: '-·', line: lineNum });
        cursor += monusMatch[0].length;
        continue;
      }
      
      // Addition operator
      if (char === '+') {
        tokens.push({ type: 'OPERATOR', value: '+', line: lineNum });
        cursor++;
        continue;
      }
      
      // Standard Subtraction
      if (char === '-' || char === '\u2212') {
        tokens.push({ type: 'OPERATOR', value: '-', line: lineNum });
        cursor++;
        continue;
      }
      
      // Numbers
      const numberMatch = lineText.substring(cursor).match(/^\d+/);
      if (numberMatch) {
        tokens.push({ type: 'NUMBER', value: numberMatch[0], line: lineNum });
        cursor += numberMatch[0].length;
        continue;
      }
      
      // GOTO Labels: M followed by digits (e.g. M0, M12) at a word boundary
      const labelMatch = lineText.substring(cursor).match(/^M\d+\b/i);
      if (labelMatch) {
        tokens.push({ type: 'LABEL', value: labelMatch[0].toUpperCase(), line: lineNum });
        cursor += labelMatch[0].length;
        continue;
      }
      
      // Identifiers & Keywords
      const identMatch = lineText.substring(cursor).match(/^[a-zA-Z_][a-zA-Z0-9_]*/);
      if (identMatch) {
        const val = identMatch[0];
        const upper = val.toUpperCase();
        if (upper === 'LOOP' || upper === 'DO' || upper === 'END' || upper === 'WHILE' || upper === 'IF' || upper === 'GOTO') {
          tokens.push({ type: 'KEYWORD', value: upper, line: lineNum });
        } else {
          tokens.push({ type: 'IDENTIFIER', value: val, line: lineNum });
        }
        cursor += val.length;
        continue;
      }
      
      throw new Error(`Unerwartetes Zeichen '${char}' in Zeile ${lineNum}`);
    }
  }
  
  tokens.push({ type: 'EOF', value: 'EOF', line: lines.length || 1 });
  return tokens;
}

// Recursive Descent Parser
export function parse(tokens, mode = 'LOOP') {
  let index = 0;
  
  function peek() {
    return tokens[index];
  }
  
  function consume(type, expectedValue) {
    const token = peek();
    if (token.type !== type) {
      throw new Error(`Syntaxfehler in Zeile ${token.line}: Erwartet '${type}'${expectedValue ? ` ('${expectedValue}')` : ''}, erhalten: '${token.type}' ('${token.value}')`);
    }
    if (expectedValue && token.value !== expectedValue) {
      throw new Error(`Syntaxfehler in Zeile ${token.line}: Erwartet '${expectedValue}', erhalten: '${token.value}'`);
    }
    index++;
    return token;
  }
  
  function match(type, value) {
    const token = peek();
    if (token.type !== type) return false;
    if (value && token.value !== value) return false;
    return true;
  }
  
  // Parse for LOOP and WHILE modes
  function parseStatementList(mode) {
    const statements = [];
    while (true) {
      while (match('SEMICOLON')) {
        consume('SEMICOLON');
      }
      
      if (match('EOF') || match('KEYWORD', 'END')) {
        break;
      }
      
      const stmt = parseStatement(mode);
      statements.push(stmt);
      
      if (match('SEMICOLON')) {
        consume('SEMICOLON');
      }
    }
    return statements;
  }
  
  function parseStatement(mode) {
    const token = peek();
    
    if (token.type === 'KEYWORD' && token.value === 'LOOP') {
      if (mode !== 'LOOP') {
        throw new Error(`Syntaxfehler in Zeile ${token.line}: 'LOOP'-Schleifen sind im ${mode}-Modus nicht erlaubt.`);
      }
      consume('KEYWORD', 'LOOP');
      const loopVar = consume('IDENTIFIER');
      consume('KEYWORD', 'DO');
      const body = parseStatementList(mode);
      consume('KEYWORD', 'END');
      
      return {
        type: 'LOOP',
        var: loopVar.value,
        body: body,
        line: token.line,
        text: `LOOP ${loopVar.value} DO`
      };
    } else if (token.type === 'KEYWORD' && token.value === 'WHILE') {
      if (mode !== 'WHILE') {
        throw new Error(`Syntaxfehler in Zeile ${token.line}: 'WHILE'-Schleifen sind im ${mode}-Modus nicht erlaubt.`);
      }
      consume('KEYWORD', 'WHILE');
      const whileVar = consume('IDENTIFIER');
      consume('KEYWORD', 'DO');
      const body = parseStatementList(mode);
      consume('KEYWORD', 'END');
      
      return {
        type: 'WHILE',
        var: whileVar.value,
        body: body,
        line: token.line,
        text: `WHILE ${whileVar.value} DO`
      };
    } else if (token.type === 'IDENTIFIER') {
      const target = consume('IDENTIFIER');
      consume('ASSIGN');
      
      let op1;
      if (match('IDENTIFIER')) {
        op1 = consume('IDENTIFIER').value;
      } else if (match('NUMBER')) {
        op1 = consume('NUMBER').value;
      } else {
        throw new Error(`Syntaxfehler in Zeile ${peek().line}: Erwartet Variable oder Zahl nach ':='`);
      }
      
      let operator = null;
      let op2 = null;
      
      if (match('OPERATOR')) {
        operator = consume('OPERATOR').value;
        if (match('IDENTIFIER')) {
          op2 = consume('IDENTIFIER').value;
        } else if (match('NUMBER')) {
          op2 = consume('NUMBER').value;
        } else {
          throw new Error(`Syntaxfehler in Zeile ${peek().line}: Erwartet Variable oder Zahl nach Operator '${operator}'`);
        }
      }
      
      let text = `${target.value} := ${op1}`;
      if (operator) text += ` ${operator} ${op2}`;
      
      return {
        type: 'ASSIGN',
        target: target.value,
        operand1: op1,
        operator: operator,
        operand2: op2,
        line: token.line,
        text: text
      };
    } else {
      const invalidToken = token.value;
      if (token.type === 'KEYWORD' && (token.value === 'IF' || token.value === 'GOTO')) {
        throw new Error(`Syntaxfehler in Zeile ${token.line}: GOTO-Befehle ('${invalidToken}') sind im ${mode}-Modus nicht erlaubt.`);
      }
      if (token.type === 'LABEL') {
        throw new Error(`Syntaxfehler in Zeile ${token.line}: Labels ('${invalidToken}') sind im ${mode}-Modus nicht erlaubt.`);
      }
      throw new Error(`Syntaxfehler in Zeile ${token.line}: Unerwartetes Token '${token.value}'. Erwartet Zuweisung oder Schleife.`);
    }
  }

  // Parse GOTO programs (flat list of labeled lines)
  function parseGotoProgram() {
    const statements = [];
    const definedLabels = new Set();
    
    while (index < tokens.length) {
      while (match('SEMICOLON')) {
        consume('SEMICOLON');
      }
      
      if (match('EOF')) {
        break;
      }
      
      // Each statement in GOTO must start with a LABEL
      if (!match('LABEL')) {
        const t = peek();
        throw new Error(`Syntaxfehler in Zeile ${t.line}: Jede Anweisung in einem GOTO-Programm muss mit einem Label beginnen (erhalten: '${t.value}').`);
      }
      
      const labelToken = consume('LABEL');
      const label = labelToken.value;
      
      if (definedLabels.has(label)) {
        throw new Error(`Syntaxfehler in Zeile ${labelToken.line}: Label '${label}' ist doppelt definiert.`);
      }
      definedLabels.add(label);
      
      consume('COLON');
      
      let stmt = null;
      const nextToken = peek();
      
      if (nextToken.type === 'KEYWORD' && nextToken.value === 'GOTO') {
        consume('KEYWORD', 'GOTO');
        const targetLabel = consume('LABEL');
        stmt = {
          type: 'GOTO_JUMP',
          label: label,
          targetLabel: targetLabel.value,
          line: labelToken.line,
          text: `${label}: GOTO ${targetLabel.value}`
        };
      } else if (nextToken.type === 'KEYWORD' && nextToken.value === 'IF') {
        consume('KEYWORD', 'IF');
        const testVar = consume('IDENTIFIER');
        consume('EQUALS');
        const testValueToken = consume('NUMBER');
        const testValue = parseInt(testValueToken.value, 10);
        consume('KEYWORD', 'GOTO');
        const targetLabel = consume('LABEL');
        stmt = {
          type: 'GOTO_IF',
          label: label,
          var: testVar.value,
          value: testValue,
          targetLabel: targetLabel.value,
          line: labelToken.line,
          text: `${label}: IF ${testVar.value} = ${testValue} GOTO ${targetLabel.value}`
        };
      } else if (nextToken.type === 'IDENTIFIER') {
        const target = consume('IDENTIFIER');
        consume('ASSIGN');
        
        let op1;
        if (match('IDENTIFIER')) {
          op1 = consume('IDENTIFIER').value;
        } else if (match('NUMBER')) {
          op1 = consume('NUMBER').value;
        } else {
          throw new Error(`Syntaxfehler in Zeile ${peek().line}: Erwartet Variable oder Zahl nach ':='`);
        }
        
        let operator = null;
        let op2 = null;
        
        if (match('OPERATOR')) {
          operator = consume('OPERATOR').value;
          if (match('IDENTIFIER')) {
            op2 = consume('IDENTIFIER').value;
          } else if (match('NUMBER')) {
            op2 = consume('NUMBER').value;
          } else {
            throw new Error(`Syntaxfehler in Zeile ${peek().line}: Erwartet Variable oder Zahl nach Operator '${operator}'`);
          }
        }
        
        let text = `${label}: ${target.value} := ${op1}`;
        if (operator) text += ` ${operator} ${op2}`;
        
        stmt = {
          type: 'ASSIGN',
          label: label,
          target: target.value,
          operand1: op1,
          operator: operator,
          operand2: op2,
          line: labelToken.line,
          text: text
        };
      } else {
        throw new Error(`Syntaxfehler in Zeile ${nextToken.line}: Unerwartetes Token '${nextToken.value}'. Erwartet Zuweisung, GOTO oder IF.`);
      }
      
      statements.push(stmt);
      
      if (match('SEMICOLON')) {
        consume('SEMICOLON');
      }
    }
    
    // Post-parse validation: Check target labels
    for (const stmt of statements) {
      if (stmt.type === 'GOTO_JUMP' || stmt.type === 'GOTO_IF') {
        if (!definedLabels.has(stmt.targetLabel)) {
          throw new Error(`Syntaxfehler: Label '${stmt.targetLabel}' wird in Zeile ${stmt.line} angesprungen, existiert aber nicht im Programm.`);
        }
      }
    }
    
    return statements;
  }

  // Parse according to mode
  if (mode === 'GOTO') {
    const ast = parseGotoProgram();
    consume('EOF');
    return ast;
  } else {
    const ast = parseStatementList(mode);
    consume('EOF');
    return ast;
  }
}
