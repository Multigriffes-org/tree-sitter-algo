/**
 * @file Algo grammar for tree-sitter
 * @author Multigriffes <multigriffes@laposte.net>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

export default grammar({
  name: "algo",

  extras: ($) => [/\s/, $.comment],

  word: ($) => $.identifier,

  conflicts: ($) => [[$.algorithme]],

  rules: {
    source_file: ($) => repeat($._definition),
    _definition: ($) => choice($.func_definition),
    _expression: ($) =>
      choice($._operation, $.primitive, $.identifier, $.func_call, $.priority),

    comment: ($) => seq("{", /[^}]*/, "}"),

    func_definition: ($) =>
      seq(
        $.identifier,
        $.parameter_list,
        optional($.output_type),
        $.vocabulary,
        $.algorithme,
      ),

    identifier: ($) => /[a-zA-Z_]+[a-zA-Z0-9_]*/,
    parameter_list: ($) =>
      seq(
        "(",
        optional(
          seq(
            seq($.identifier, $.type_definition),
            repeat(seq(",", $.identifier, $.type_definition)),
          ),
        ),
        ")",
      ),
    type_definition: ($) => seq(":", $._type),
    output_type: ($) => seq("->", $._type),

    vocabulary: ($) => seq("Lexique:", repeat($._declaration)),

    _declaration: ($) =>
      choice($.const_declaration, $.func_declaration, $.var_declaration),
    var_declaration: ($) => seq($.identifier, $.type_definition),
    const_declaration: ($) =>
      seq($.identifier, $.type_definition, $.const_assignation),
    const_assignation: ($) => seq(":=", $._expression),
    func_declaration: ($) =>
      seq($.identifier, $.parameter_type_list, optional($.output_type)),

    parameter_type_list: ($) =>
      seq("(", optional(seq($._type, repeat(seq(",", $._type)))), ")"),

    algorithme: ($) => seq("Algorithme:", repeat($.statement)),

    statement: ($) => choice($.return, $.assignation),
    assignation: ($) => seq($.identifier, "<-", $._expression),
    return: ($) => seq(choice("retourner", "return"), $._expression),

    func_call: ($) => seq($.identifier, $.parameter_list),

    _type: ($) => choice($.primitive_type),

    primitive_type: ($) =>
      choice($.float_type, $.int_type, $.bool_type, $.string_type, $.void_type),
    float_type: ($) => choice("reel", "réel", "float"),
    int_type: ($) => choice("int", "entier"),
    string_type: ($) => "string",
    void_type: ($) => "void",
    bool_type: ($) => "bool",

    primitive: ($) => choice($.float, $.int, $.string, $.bool),
    float: ($) => /[0-9]+\.[0-9]+/,
    int: ($) => /[0-9]+/,
    string: ($) => seq('"', /[^"]*/, '"'),
    bool: ($) => choice("true", "false"),

    _operation: ($) => choice($.add, $.sub, $.mul, $.div, $.reminder, $.minus),
    add: ($) => prec.left(1, seq($._expression, "+", $._expression)),
    sub: ($) => prec.left(1, seq($._expression, "-", $._expression)),
    mul: ($) => prec.left(2, seq($._expression, "*", $._expression)),
    div: ($) => prec.left(2, seq($._expression, "/", $._expression)),
    reminder: ($) => prec.left(2, seq($._expression, "%", $._expression)),
    minus: ($) => prec(3, seq("-", $._expression)),

    priority: ($) => seq("(", $._expression, ")"),
  },
});
