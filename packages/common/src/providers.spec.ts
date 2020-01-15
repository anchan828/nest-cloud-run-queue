import { ModuleOptions, ModuleOptionsFactory } from "./interfaces";
import { createAsyncOptionsProvider, createAsyncProviders, createOptionProvider } from "./providers";
it("createOptionProvider", () => {
  expect(createOptionProvider("test", {})).toEqual({ provide: "test", useValue: {} });
});

it("createAsyncOptionsProvider", () => {
  expect(createAsyncOptionsProvider("test", {})).toEqual({
    inject: [],
    provide: "test",
    useFactory: expect.any(Function),
  });

  expect(createAsyncOptionsProvider("test", { useFactory: expect.any(Function) })).toEqual({
    inject: [],
    provide: "test",
    useFactory: expect.any(Function),
  });

  const res = createAsyncOptionsProvider("test", {});
  expect(res).toEqual({ inject: [], provide: "test", useFactory: expect.any(Function) });
  res.useFactory({ createModuleOptions: jest.fn() });

  class OptionsClass implements ModuleOptionsFactory {
    createModuleOptions(): ModuleOptions {
      return {};
    }
  }

  expect(createAsyncOptionsProvider("test", { useClass: OptionsClass })).toEqual({
    inject: [expect.any(Function)],
    provide: "test",
    useFactory: expect.any(Function),
  });
});

it("createAsyncProviders", () => {
  expect(createAsyncProviders("test", {})).toEqual([
    { inject: [], provide: "test", useFactory: expect.any(Function) },
    { provide: undefined, useClass: undefined },
  ]);

  expect(
    createAsyncProviders("test", {
      useFactory: () => {
        return {};
      },
    }),
  ).toEqual([{ inject: [], provide: "test", useFactory: expect.any(Function) }]);
});
