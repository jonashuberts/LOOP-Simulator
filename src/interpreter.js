export function getVal(operand, vars) {
  if (/^\d+$/.test(operand)) {
    return parseInt(operand, 10);
  }
  return vars[operand] || 0;
}

// Generator-based Execution (supporting LOOP, WHILE, and GOTO modes)
export function* executeProgram(ast, vars, mode = 'LOOP') {
  if (mode === 'GOTO') {
    // ast is a flat list of GOTO statements
    let ip = 0;
    
    // Create a mapping from label to instruction index for quick lookup
    const labelMap = {};
    for (let i = 0; i < ast.length; i++) {
      labelMap[ast[i].label] = i;
    }
    
    while (ip >= 0 && ip < ast.length) {
      const node = ast[ip];
      
      if (node.type === 'GOTO_JUMP') {
        const targetIp = labelMap[node.targetLabel];
        
        yield {
          node: node,
          line: node.line,
          text: `${node.label}: GOTO ${node.targetLabel} (Sprung zu Zeile ${ast[targetIp].line})`,
          vars: { ...vars }
        };
        
        ip = targetIp;
        continue;
      } else if (node.type === 'GOTO_IF') {
        const val = vars[node.var] || 0;
        const conditionMet = val === node.value;
        
        let targetIp;
        let actionText = '';
        
        if (conditionMet) {
          targetIp = labelMap[node.targetLabel];
          actionText = `Bedingung erfüllt (${node.var} = ${node.value}), Sprung zu ${node.targetLabel} (Zeile ${ast[targetIp].line})`;
        } else {
          targetIp = ip + 1;
          actionText = `Bedingung nicht erfüllt (${node.var} = ${val} != ${node.value}), fahre fort mit nächster Zeile`;
        }
        
        yield {
          node: node,
          line: node.line,
          text: `${node.label}: IF ${node.var} = ${node.value} GOTO ${node.targetLabel} (${actionText})`,
          vars: { ...vars }
        };
        
        ip = targetIp;
        continue;
      } else if (node.type === 'ASSIGN') {
        const target = node.target;
        const val1 = getVal(node.operand1, vars);
        const op = node.operator;
        const val2 = node.operand2 !== null ? getVal(node.operand2, vars) : null;
        
        let result = val1;
        let opText = '';
        if (op === '+') {
          result = val1 + val2;
          opText = `+ ${node.operand2}`;
        } else if (op === '-' || op === '-·') {
          result = Math.max(0, val1 - val2); // Monus clamp at 0
          opText = `-\u00B7 ${node.operand2}`;
        } else {
          opText = `+ 0`;
        }
        
        vars[target] = result;
        
        yield {
          node: node,
          line: node.line,
          text: `${node.label}: ${target} := ${node.operand1} ${opText} (Wert: ${result})`,
          vars: { ...vars }
        };
        
        ip++;
      }
    }
  } else {
    // LOOP or WHILE mode
    for (let node of ast) {
      if (node.type === 'LOOP') {
        const count = vars[node.var] || 0;
        
        yield {
          node: node,
          line: node.line,
          text: `LOOP ${node.var} DO (${count} Schleifendurchläufe fixiert)`,
          vars: { ...vars }
        };
        
        for (let i = 0; i < count; i++) {
          yield* executeProgram(node.body, vars, mode);
        }
        
        yield {
          node: node,
          line: node.line,
          text: `END (LOOP ${node.var} beendet)`,
          vars: { ...vars }
        };
      } else if (node.type === 'WHILE') {
        yield {
          node: node,
          line: node.line,
          text: `WHILE ${node.var} DO (Prüfe Bedingung: ${node.var} = ${vars[node.var] || 0})`,
          vars: { ...vars }
        };
        
        while ((vars[node.var] || 0) !== 0) {
          yield* executeProgram(node.body, vars, mode);
          
          yield {
            node: node,
            line: node.line,
            text: `WHILE ${node.var} DO (Erneute Prüfung: ${node.var} = ${vars[node.var] || 0})`,
            vars: { ...vars }
          };
        }
        
        yield {
          node: node,
          line: node.line,
          text: `END (WHILE ${node.var} beendet, da Wert = 0)`,
          vars: { ...vars }
        };
      } else if (node.type === 'ASSIGN') {
        const target = node.target;
        const val1 = getVal(node.operand1, vars);
        const op = node.operator;
        const val2 = node.operand2 !== null ? getVal(node.operand2, vars) : null;
        
        let result = val1;
        let opText = '';
        if (op === '+') {
          result = val1 + val2;
          opText = `+ ${node.operand2}`;
        } else if (op === '-' || op === '-·') {
          result = Math.max(0, val1 - val2); // Monus clamp at 0
          opText = `-\u00B7 ${node.operand2}`;
        } else {
          opText = `+ 0`;
        }
        
        vars[target] = result;
        
        yield {
          node: node,
          line: node.line,
          text: `${target} := ${node.operand1} ${opText} (Wert: ${result})`,
          vars: { ...vars }
        };
      }
    }
  }
}
