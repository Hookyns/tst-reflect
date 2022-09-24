import { ITest } from "./test.interface";

export class CTest
{
  public foo: ITest = { foo: "" };

  constructor()
  {
  }

  lorem(ipsum: boolean): string
  {
    return ipsum + "";
  }

  optionalMethod?(): void
  {

  }
}
