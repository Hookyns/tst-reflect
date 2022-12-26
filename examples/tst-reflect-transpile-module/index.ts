import * as path from 'path';
import * as ttsc from 'ttypescript';

const compiledTSX = `
import { getType } from 'tst-reflect';

function printTypeProperties<TType>() {
  const type = getType<TType>(); // <<== get type of type parameter TType

  console.log(
    type
      .getProperties()
      .map((prop) => prop.name + ': ' + prop.type.name)
      .join('\n')
  );

  return <>
    <h1>Hello World!</h1>
  </>;
}

interface SomeType {
  foo: string;
  bar: number;
  baz: Date;
}

getType<SomeType>();
printTypeProperties<SomeType>();
`;
console.log(
  '\n\n----------\n',
  ttsc.transpileModule(compiledTSX, {
    fileName: 'index.tsx',
    compilerOptions: {
      configFilePath: path.resolve(process.cwd(), 'tsconfig.json'),
      target: ttsc.ScriptTarget.ESNext,
      moduleResolution: ttsc.ModuleResolutionKind.NodeNext,
      jsx: ttsc.JsxEmit.ReactJSX,
      jsxImportSource: 'jsx',
      experimentalDecorators: true,
      module: ttsc.ModuleKind.ESNext,
      allowJs: true,
      esModuleInterop: true,
      alwaysStrict: true,
      //skipDefaultLibCheck: true,
      //skipLibCheck: true,
      skipDefaultLibCheck: false,
      skipLibCheck: false,
      typeRoots: ['node_modules/@types'],
      plugins: [
        {
          // @ts-expect-error
          transform: 'tst-reflect-transformer',
          debugMode: true,
        },
      ],
    },
  }).outputText,
  '\n\n----------\n'
);
