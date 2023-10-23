#!/usr/bin/env bash

set -euo pipefail

export DISABLE_BOOTSTRAP_VALIDATION=false
.buildkite/scripts/bootstrap.sh

.buildkite/scripts/steps/checks/precommit_hook.sh
.buildkite/scripts/steps/checks/ts_projects.sh
.buildkite/scripts/steps/checks/packages.sh
.buildkite/scripts/steps/checks/bazel_packages.sh
.buildkite/scripts/steps/checks/verify_notice.sh
.buildkite/scripts/steps/checks/plugin_list_docs.sh
.buildkite/scripts/steps/checks/event_log.sh
.buildkite/scripts/steps/checks/telemetry.sh
.buildkite/scripts/steps/checks/jest_configs.sh
.buildkite/scripts/steps/checks/bundle_limits.sh
.buildkite/scripts/steps/checks/i18n.sh
.buildkite/scripts/steps/checks/file_casing.sh
.buildkite/scripts/steps/checks/licenses.sh
.buildkite/scripts/steps/checks/test_projects.sh
.buildkite/scripts/steps/checks/test_hardening.sh
.buildkite/scripts/steps/checks/ftr_configs.sh
.buildkite/scripts/steps/checks/saved_objects_compat_changes.sh
.buildkite/scripts/steps/code_generation/security_solution_codegen.sh
.buildkite/scripts/steps/checks/yarn_deduplicate.sh
