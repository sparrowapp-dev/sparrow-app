import type { AggregateEnvironment } from "./InputEditorTheme";
import { ViewPlugin, MatchDecorator, Decoration } from "@codemirror/view";
const ENVIRONMENT_REGEX = /({{[a-zA-Z0-9-_]+}})/g;

const ENV_HIGHLIGHT = "env-highlight";
const HOVER_FOUND = "hover-found";
const HOVER_NOT_FOUND = "hover-not-found";
function checkHoverEnv(env: string, aggregateEnvs: AggregateEnvironment[]) {
  const className = aggregateEnvs.find(
    (k: { key: string }) => k.key === env.slice(2, -2),
  )
    ? HOVER_FOUND
    : HOVER_NOT_FOUND;

  return Decoration.mark({
    class: `${ENV_HIGHLIGHT} ${className}`,
  });
}

const getHoverMatchDecorator = (aggregateEnvs: AggregateEnvironment[]) =>
  new MatchDecorator({
    regexp: ENVIRONMENT_REGEX,
    decoration: (m) => checkHoverEnv(m[0], aggregateEnvs),
  });

export const environmentHoverHighlightStyle = (
  aggregateEnvs: AggregateEnvironment[],
) => {
  const decorator = getHoverMatchDecorator(aggregateEnvs);

  return ViewPlugin.define(
    (view) => ({
      decorations: decorator.createDeco(view),
      update(u) {
        this.decorations = decorator.updateDeco(u, this.decorations);
      },
    }),
    {
      decorations: (v) => v.decorations,
    },
  );
};
