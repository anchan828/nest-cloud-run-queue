import { Provider, Type } from "@nestjs/common";
import { Abstract, ClassProvider, FactoryProvider } from "@nestjs/common/interfaces";
import { ModuleAsyncOptions, ModuleOptions, ModuleOptionsFactory } from "./interfaces";

type ProvideType = string | symbol | Type<any> | Abstract<any> | Function;

export function createOptionProvider(provide: ProvideType, options: ModuleOptions): Provider {
  return { provide, useFactory: () => options };
}

export function createAsyncOptionsProvider(provide: ProvideType, options: ModuleAsyncOptions): FactoryProvider {
  if (options.useFactory) {
    return {
      inject: options.inject || [],
      provide,
      useFactory: options.useFactory,
    };
  }
  return {
    inject: [options.useClass || options.useExisting].filter((x): x is Type<ModuleOptionsFactory> => x !== undefined),
    provide,
    useFactory: async (optionsFactory: ModuleOptionsFactory): Promise<ModuleOptions> =>
      optionsFactory.createModuleOptions(),
  };
}

export function createAsyncProviders(provide: ProvideType, options: ModuleAsyncOptions): Provider[] {
  const asyncOptionsProvider = createAsyncOptionsProvider(provide, options);
  if (options.useExisting || options.useFactory) {
    return [asyncOptionsProvider];
  }
  return [
    asyncOptionsProvider,
    {
      provide: options.useClass,
      useClass: options.useClass,
    } as ClassProvider,
  ];
}
