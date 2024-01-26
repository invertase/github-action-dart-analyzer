import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as fs from 'fs';
import * as util from 'util';

export interface AnalyzerOptions {
  fatalInfos: boolean;
  fatalWarnings: boolean;
  annotate: boolean;
  annotateOnly: boolean;
  customLint: boolean;
  workingDirectory: string;
}

// False positive eslint error saying AnalyzerProblemSeverity is already defined.
// eslint-disable-next-line no-shadow
export enum AnalyzerProblemSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
}

export interface AnalyzerProblem {
  code: string;
  severity: AnalyzerProblemSeverity;
  type: string;
  location: AnalyzerProblemLocation;
  problemMessage: string;
  correctionMessage?: string;
  documentation?: string;
}

export interface AnalyzerProblemLocation {
  file: string;
  range: AnalyzerProblemLocationRange;
}

export interface AnalyzerProblemLocationRange {
  start: AnalyzerProblemLocationRangeStartOrEnd;
  end: AnalyzerProblemLocationRangeStartOrEnd;
}

export interface AnalyzerProblemLocationRangeStartOrEnd {
  offset: number;
  line: number;
  column: number;
}

export interface AnalyzerResult {
  // All info problems.
  infos: AnalyzerProblem[];
  // All warning problems.
  warnings: AnalyzerProblem[];
  // All error problems.
  errors: AnalyzerProblem[];
}

export async function analyze(
  cwd: string,
  customLint: boolean,
): Promise<AnalyzerResult> {
  const analyzeOutput = await exec.getExecOutput(
    'dart',
    ['analyze', '--format=json', '.'],
    {
      cwd,
      silent: true,
      ignoreReturnCode: true,
    },
  );
  const result = parseAnalyzerResult(analyzeOutput.stdout.trim());
  if (customLint) {
    const pubspec =
      cwd == null
        ? 'pubspec.yaml'
        : cwd.endsWith('/')
        ? cwd
        : `${cwd}/pubspec.yaml`;
    const readFile = util.promisify(fs.readFile);
    const contents = await readFile(pubspec, 'utf8');
    if (contents.includes('custom_lint:')) {
      const customLintOutput = await exec.getExecOutput(
        'dart',
        ['run', 'custom_lint', '--format=json', '.'],
        {
          cwd,
          silent: true,
          ignoreReturnCode: true,
        },
      );
      const customLintResult = parseAnalyzerResult(
        customLintOutput.stdout.trim(),
      );
      result.infos.push(...customLintResult.infos);
      result.warnings.push(...customLintResult.warnings);
      result.errors.push(...customLintResult.errors);
    }
  }
  return result;
}

export function parseAnalyzerResult(
  machineReadableOutput: string,
): AnalyzerResult {
  const jsonStart = machineReadableOutput.indexOf('{');
  const jsonEnd = machineReadableOutput.lastIndexOf('}');
  if (jsonStart === -1 || jsonEnd === -1) {
    core.debug(`Failed to parse analyzer output: "${machineReadableOutput}"`);
    return {
      infos: [],
      warnings: [],
      errors: [],
    };
  }
  const problems: AnalyzerProblem[] = JSON.parse(
    machineReadableOutput.substring(jsonStart, jsonEnd + 1),
  ).diagnostics as AnalyzerProblem[];

  const infos: AnalyzerProblem[] = [];
  const warnings: AnalyzerProblem[] = [];
  const errors: AnalyzerProblem[] = [];
  for (const problem of problems) {
    if (problem.severity === AnalyzerProblemSeverity.INFO) {
      infos.push(problem);
    }
    if (problem.severity === AnalyzerProblemSeverity.WARNING) {
      warnings.push(problem);
    }
    if (problem.severity === AnalyzerProblemSeverity.ERROR) {
      errors.push(problem);
    }
  }
  return {
    infos,
    warnings,
    errors,
  };
}
