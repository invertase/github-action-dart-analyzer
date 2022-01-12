import * as core from '@actions/core';
import * as path from 'path';
import { AnalyzerOptions, AnalyzerProblem, analyze } from './dart';

function getProblemLogMessage(
  problem: AnalyzerProblem,
  detailed = false,
): string {
  let message = `${problem.location.file}:${problem.location.range.start.line}:${problem.location.range.start.column} ${problem.problemMessage}`;
  if (detailed && problem.correctionMessage) {
    message += `\n  └ ${problem.correctionMessage}`;
  }
  if (detailed && problem.documentation) {
    message += `\n  └ ${problem.documentation}`;
  }
  return message;
}

function getAnnotationMessage(problem: AnalyzerProblem): string {
  let message = ``;
  if (problem.correctionMessage) {
    if (message.length) message += '\n\n';
    message += `${problem.correctionMessage}`;
  }
  if (problem.documentation) {
    if (message.length) message += '\n\n';
    message += `See ${problem.documentation} to learn more about this problem.`;
  }
  return message;
}

function getProblemAnnotationProperties(
  problem: AnalyzerProblem,
): core.AnnotationProperties {
  return {
    title: problem.problemMessage,
    file: problem.location.file,
    startLine: problem.location.range.start.line,
    endLine: problem.location.range.end.line,
    startColumn: problem.location.range.start.column,
    endColumn: problem.location.range.end.column,
  };
}

async function run(): Promise<void> {
  try {
    const options: AnalyzerOptions = {
      fatalInfos: core.getBooleanInput('fatal-infos'),
      fatalWarnings: core.getBooleanInput('fatal-warnings'),
      annotate: core.getBooleanInput('annotate'),
      annotateOnly: core.getBooleanInput('annotate-only'),
      workingDirectory: path.resolve(
        process.env['GITHUB_WORKSPACE'] || process.cwd(),
        core.getInput('working-directory'),
      ),
    };

    core.debug(
      `Running Dart analyzer with options: ${JSON.stringify(options)}`,
    );
    const result = await analyze(options.workingDirectory);

    // Report info problems.
    if (result.infos.length) {
      core.startGroup('Dart Analyzer - Infos');
      if (!result.infos.length) {
        core.info('No info problems detected.');
      }
      for (const info of result.infos) {
        core.info(getProblemLogMessage(info, !options.annotate));
        if (options.annotate) {
          core.notice(
            getAnnotationMessage(info),
            getProblemAnnotationProperties(info),
          );
        }
      }
      core.endGroup();
    }

    // Report warning problems.
    if (result.warnings.length) {
      core.startGroup('Dart Analyzer - Warnings');
      if (!result.warnings.length) {
        core.info('No warning problems detected.');
      }
      for (const warning of result.warnings) {
        core.info(getProblemLogMessage(warning, !options.annotate));
        if (options.annotate) {
          core.warning(
            getAnnotationMessage(warning),
            getProblemAnnotationProperties(warning),
          );
        }
      }
      core.endGroup();
    }

    // Report error problems.
    if (result.errors.length) {
      core.startGroup('Dart Analyzer - Errors');
      if (!result.errors.length) {
        core.info('No error problems detected.');
      }
      for (const error of result.errors) {
        core.info(getProblemLogMessage(error, !options.annotate));
        if (options.annotate) {
          core.error(
            getAnnotationMessage(error),
            getProblemAnnotationProperties(error),
          );
        }
      }
      core.endGroup();
    }

    let actionDidFail = false;
    if (options.fatalInfos && result.infos.length) {
      actionDidFail = true;
    } else if (options.fatalWarnings && result.warnings.length) {
      actionDidFail = true;
    } else if (!options.annotateOnly && result.errors.length) {
      actionDidFail = true;
    }

    core.exportVariable(
      'DART_ANALYZER_FAILED',
      actionDidFail ? 'true' : 'false',
    );
    core.exportVariable(
      'DART_ANALYZER_INFO_COUNT',
      result.infos.length.toString(),
    );
    core.exportVariable(
      'DART_ANALYZER_WARNING_COUNT',
      result.warnings.length.toString(),
    );
    core.exportVariable(
      'DART_ANALYZER_ERROR_COUNT',
      result.errors.length.toString(),
    );
    core.setOutput('infos', result.infos.length.toString());
    core.setOutput('warnings', result.warnings.length.toString());
    core.setOutput('errors', result.errors.length.toString());
    if (actionDidFail) {
      core.setFailed(`Dart Analyzer detected problems.`);
    } else {
      core.info(`Finished.`);
    }
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message);
  }
}

run();
