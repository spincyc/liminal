"use strict";

// A small parser for SAT answer-choice strings, so the families gate can read
// a choice such as "−3/4", "$1,200", "2√3", "12%", or "5π" as a number.
// Handles numbers, single-letter variables, π, √, ^, superscripts, implicit
// multiplication, and + − × · / ( ). Text with a word of three or more letters,
// or a short word such as "or" or "is", is prose and does not parse.
//
// Ported from the 2026-09 cold review's scripts (lane-math/expr.js), which
// define the blind "hub" strategy the gate measures; the one change is that a
// variable evaluates to NaN instead of a random value, so every result here
// is deterministic.

const SUPERSCRIPTS = {
  "⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4", "⁵": "5", "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9",
  "⁻": "-", "⁄": "/",
};

function tokenize(text) {
  if (/[a-zA-Z]{3,}/.test(text) || /\b(or|and|is|no|to|of|in|at|by|as)\b/i.test(text)) return null;
  const source = String(text)
    .replace(/−/g, "-")
    .replace(/[×·]/g, "*")
    .replace(/(\d),(\d{3})/g, "$1$2")
    .replace(/^\$/, "")
    .replace(/(\d)%/g, "$1*0.01")
    .replace(/\s+/g, "");
  const tokens = [];
  let index = 0;
  while (index < source.length) {
    const character = source[index];
    if (/[0-9.]/.test(character)) {
      let end = index;
      while (end < source.length && /[0-9.]/.test(source[end])) end += 1;
      tokens.push({ type: "num", value: Number(source.slice(index, end)) });
      index = end;
    } else if (SUPERSCRIPTS[character] !== undefined) {
      let end = index;
      let digits = "";
      while (end < source.length && SUPERSCRIPTS[source[end]] !== undefined) {
        digits += SUPERSCRIPTS[source[end]];
        end += 1;
      }
      tokens.push({ type: "^" }, { type: "supnum", value: digits });
      index = end;
    } else if (/[a-zA-Z]/.test(character)) {
      tokens.push({ type: "var", value: character });
      index += 1;
    } else if (character === "π") {
      tokens.push({ type: "num", value: Math.PI });
      index += 1;
    } else if (character === "√") {
      tokens.push({ type: "sqrt" });
      index += 1;
    } else if ("+-*/^()".includes(character)) {
      tokens.push({ type: character });
      index += 1;
    } else return null;
  }
  return tokens;
}

// Returns { value, vars } or null when the text does not parse. `value` is
// NaN when the expression has variables.
function parse(text) {
  const tokens = tokenize(text);
  if (!tokens || !tokens.length) return null;
  let position = 0;
  const peek = () => tokens[position];
  const eat = (type) => {
    if (tokens[position] && tokens[position].type === type) {
      position += 1;
      return true;
    }
    return false;
  };
  const startsAtom = (token) =>
    token && (token.type === "num" || token.type === "var" || token.type === "(" || token.type === "sqrt");

  function expression() {
    let left = term();
    while (peek() && (peek().type === "+" || peek().type === "-")) {
      const operator = tokens[position].type;
      position += 1;
      const right = term();
      left = operator === "+" ? left + right : left - right;
    }
    return left;
  }
  function term() {
    let left = unary();
    for (;;) {
      const token = peek();
      if (token && (token.type === "*" || token.type === "/")) {
        position += 1;
        const right = unary();
        left = token.type === "*" ? left * right : left / right;
      } else if (startsAtom(token)) {
        left *= power();
      } else break;
    }
    return left;
  }
  function unary() {
    if (eat("-")) return -unary();
    if (eat("+")) return unary();
    return power();
  }
  function power() {
    const base = atom();
    if (peek() && peek().type === "^") {
      position += 1;
      if (peek() && peek().type === "supnum") {
        const digits = tokens[position].value;
        position += 1;
        if (digits.includes("/")) {
          const [top, bottom] = digits.split("/").map(Number);
          return Math.pow(base, top / bottom);
        }
        return Math.pow(base, Number(digits));
      }
      return Math.pow(base, exponent());
    }
    return base;
  }
  function exponent() {
    if (eat("-")) return -exponent();
    return power();
  }
  function atom() {
    const token = tokens[position];
    position += 1;
    if (!token) throw new Error("unexpected end");
    if (token.type === "num") {
      if (!Number.isFinite(token.value)) throw new Error("bad number");
      return token.value;
    }
    if (token.type === "var") return NaN;
    if (token.type === "sqrt") return Math.sqrt(power());
    if (token.type === "(") {
      const value = expression();
      if (!eat(")")) throw new Error("unclosed (");
      return value;
    }
    throw new Error(`unexpected ${token.type}`);
  }

  try {
    const value = expression();
    if (position !== tokens.length) return null;
    const vars = [...new Set(tokens.filter((token) => token.type === "var").map((token) => token.value))];
    return { value: vars.length ? NaN : value, vars };
  } catch (error) {
    return null;
  }
}

// The number a choice names, or null when it is prose, has a variable, or is
// not finite.
function numericValue(text) {
  const parsed = parse(text);
  if (!parsed || parsed.vars.length || !Number.isFinite(parsed.value)) return null;
  return parsed.value;
}

module.exports = { numericValue, parse, tokenize };
