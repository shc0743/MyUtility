package Calc;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.math.MathContext;
import java.math.RoundingMode;

/**
 * 精准计算器 — 基于 BigDecimal 的命令行计算器。
 * 
 * 用法：
 *   java Calc.Main                 进入 REPL 模式，提示符 "> "
 *   java Calc.Main "1+1" "0.1+0.2" 每行一个输出每个参数的计算结果
 */
public class Main {

    /** 34位十进制精度，HALF_UP舍入 — 与 DECIMAL128 一致但显式控制舍入模式。 */
    private static final MathContext MC = new MathContext(34, RoundingMode.HALF_UP);

    // ---- 程序入口 ----------------------------------------------------------------

    public static void main(String[] args) {
        if (args.length > 0) {
            // 命令行模式：对每个参数求值并逐行输出
            for (String arg : args) {
                try {
                    BigDecimal result = evaluate(arg);
                    System.out.println(formatResult(result));
                } catch (Exception e) {
                    System.out.println("Error: " + e.getMessage());
                }
            }
        } else {
            // REPL 模式
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(System.in))) {
                while (true) {
                    System.out.print("> ");
                    System.out.flush();
                    String line = reader.readLine();
                    if (line == null) {          // EOF (Ctrl+D)
                        break;
                    }
                    line = line.trim();
                    if (line.isEmpty()) {
                        continue;
                    }
                    try {
                        BigDecimal result = evaluate(line);
                        System.out.println(formatResult(result));
                    } catch (Exception e) {
                        System.out.println("Error: " + e.getMessage());
                    }
                }
            } catch (Exception e) {
                System.err.println("Fatal: " + e.getMessage());
            }
        }
    }

    // ---- 公共接口 ----------------------------------------------------------------

    /** 对外求值入口：去除空白后交给递归下降解析器。 */
    static BigDecimal evaluate(String expression) {
        return new Parser(expression).parse();
    }

    /** 将结果格式化为精准的十进制字符串（去除尾部零，避免科学记数法）。 */
    static String formatResult(BigDecimal value) {
        return value.stripTrailingZeros().toPlainString();
    }

    // ---- 递归下降解析器（内部类）-----------------------------------------------

    private static class Parser {
        private final String input;
        private int pos;

        Parser(String input) {
            this.input = input.replaceAll("\\s+", ""); // 移除所有空白
            this.pos = 0;
        }

        BigDecimal parse() {
            if (input.isEmpty()) {
                throw new IllegalArgumentException("empty expression");
            }
            BigDecimal result = parseExpr();
            if (pos < input.length()) {
                throw new IllegalArgumentException(
                        "unexpected character '" + input.charAt(pos) + "' at position " + pos);
            }
            return result;
        }

        // ---- 表达式层：+ / - -------------------------------------------------

        /** expr ::= term (('+' | '-') term)* */
        private BigDecimal parseExpr() {
            BigDecimal left = parseTerm();
            while (pos < input.length()) {
                char c = input.charAt(pos);
                if (c == '+') {
                    pos++;
                    left = left.add(parseTerm(), MC);
                } else if (c == '-') {
                    pos++;
                    left = left.subtract(parseTerm(), MC);
                } else {
                    break;
                }
            }
            return left;
        }

        // ---- 项层：* / / ----------------------------------------------------

        /** term ::= factor (('*' | '/') factor)* */
        private BigDecimal parseTerm() {
            BigDecimal left = parseFactor();
            while (pos < input.length()) {
                char c = input.charAt(pos);
                if (c == '*') {
                    pos++;
                    left = left.multiply(parseFactor(), MC);
                } else if (c == '/') {
                    pos++;
                    // 除法使用精度上下文避免非终止小数展开异常
                    left = left.divide(parseFactor(), MC);
                } else {
                    break;
                }
            }
            return left;
        }

        // ---- 因子层：一元 +/- 、括号、数字 ----------------------------------

        /** factor ::= ('+' | '-') factor | '(' expr ')' | number */
        private BigDecimal parseFactor() {
            if (pos >= input.length()) {
                throw new IllegalArgumentException("unexpected end of expression");
            }
            char c = input.charAt(pos);
            if (c == '+') {
                pos++;
                return parseFactor();                 // 一元正号，直接跳过
            }
            if (c == '-') {
                pos++;
                return parseFactor().negate();       // 一元负号，取反
            }
            if (c == '(') {
                pos++;
                BigDecimal inner = parseExpr();
                if (pos >= input.length() || input.charAt(pos) != ')') {
                    throw new IllegalArgumentException("missing ')'");
                }
                pos++;
                return inner;
            }
            return parseNumber();
        }

        // ---- 数字 -----------------------------------------------------------

        private BigDecimal parseNumber() {
            int start = pos;
            while (pos < input.length()
                    && (Character.isDigit(input.charAt(pos)) || input.charAt(pos) == '.')) {
                pos++;
            }
            if (start == pos) {
                throw new IllegalArgumentException("expected a number at position " + pos);
            }
            String numStr = input.substring(start, pos);
            // 使用字符串构造器避免 double → BigDecimal 的精度损失
            return new BigDecimal(numStr);
        }
    }
}
