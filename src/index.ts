#!/usr/bin/env node

import program = require('commander');
import debugModule = require('debug');
import fs = require('fs');
import path = require('path');
import {SnykToHtml} from './lib/snyk-to-html';

program
.option('-t, --template <path>', 'Template location for generating the html. Defaults to template/test-report.hbs')
.option('-i, --input <path>', 'Input path from where to read the json. Defaults to stdin')
.option('-o, --output <path>', 'Output of the resulting HTML. Example: -o snyk.html. Defaults to stdout')
.option('-s, --summary', 'Generates an HTML with only the summary, instead of the details report')
.option('-d, --debug', 'Runs the CLI in debug mode')
.option('-a, --actionable-remediation', 'Display actionable remediation info if available')
.parse(process.argv);

let template;
let source;
let output;

if (program.template) { // template
  template = program.template; // grab the next item
  if (typeof template === 'boolean') {
    template = path.join(__dirname, '../template/test-report.hbs');
  }
} else {
  template = path.join(__dirname, '../template/test-report.hbs');
}
if (program.input) { // input source
  source = program.input; // grab the next item
  if (typeof source === 'boolean') {
    source = undefined;
  }
}
if (program.output) { // output destination
  output = program.output; // grab the next item
  if (typeof output === 'boolean') {
    output = undefined;
  }
}

if (program.debug) {
  const nameSpace = 'snyk-to-html';
  process.env.DEBUG = nameSpace;

  debugModule.enable(nameSpace);
}

if (!source) {
  console.log('Detected no input. Please validate that the input provided to the CLI is an actual JSON. \nFor more options see `snyk-to-html --help`');
}

SnykToHtml.run(source,
  !!program.actionableRemediation,
  template,
  !!program.summary,
  onReportOutput);

function onReportOutput(report: string): void {
  if (output) {
    fs.writeFile(output, report, err => {
      if (err) {
        return console.log(err);
      }
      console.log('Vulnerability snapshot saved at ' + output);
    });
  } else {
    console.log(report);
  }
}
