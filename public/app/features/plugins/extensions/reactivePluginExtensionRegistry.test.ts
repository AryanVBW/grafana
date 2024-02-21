import { firstValueFrom } from 'rxjs';

import { PluginExtensionTypes } from '@grafana/data';

import { ReactivePluginExtenionRegistry } from './reactivePluginExtensionRegistry';

describe('createPluginExtensionsRegistry', () => {
  const originalWarn = global.console.warn;

  beforeAll(() => {
    global.console.warn = jest.fn();
  });

  afterAll(() => {
    global.console.warn = originalWarn;
  });

  it('should return empty registry when no extensions registered', async () => {
    const reactiveRegistry = new ReactivePluginExtenionRegistry();
    const observable = reactiveRegistry.asObservable();
    const registry = await firstValueFrom(observable);
    expect(registry).toEqual({});
  });

  it('should be possible to register extensions in the registry', async () => {
    const pluginId = 'grafana-basic-app';
    const reactiveRegistry = new ReactivePluginExtenionRegistry();

    reactiveRegistry.register({
      pluginId,
      extensionConfigs: [
        {
          type: PluginExtensionTypes.link,
          title: 'Link 1',
          description: 'Link 1 description',
          path: `/a/${pluginId}/declare-incident`,
          extensionPointId: 'grafana/dashboard/panel/menu',
          configure: jest.fn().mockReturnValue({}),
        },
        {
          type: PluginExtensionTypes.link,
          title: 'Link 2',
          description: 'Link 2 description',
          path: `/a/${pluginId}/declare-incident`,
          extensionPointId: 'plugins/myorg-basic-app/start',
          configure: jest.fn().mockImplementation((context) => ({ title: context?.title })),
        },
      ],
    });

    const registry = await reactiveRegistry.getRegistry();

    expect(registry).toEqual({
      'grafana/dashboard/panel/menu': [
        {
          pluginId: pluginId,
          config: {
            type: PluginExtensionTypes.link,
            title: 'Link 1',
            description: 'Link 1 description',
            path: `/a/${pluginId}/declare-incident`,
            extensionPointId: 'grafana/dashboard/panel/menu',
            configure: expect.any(Function),
          },
        },
      ],
      'plugins/myorg-basic-app/start': [
        {
          pluginId: pluginId,
          config: {
            type: PluginExtensionTypes.link,
            title: 'Link 2',
            description: 'Link 2 description',
            path: `/a/${pluginId}/declare-incident`,
            extensionPointId: 'plugins/myorg-basic-app/start',
            configure: expect.any(Function),
          },
        },
      ],
    });
  });

  it('should be possible to asynchronously register extensions for the same placement (different plugins)', async () => {
    const pluginId1 = 'grafana-basic-app';
    const pluginId2 = 'grafana-basic-app2';
    const reactiveRegistry = new ReactivePluginExtenionRegistry();

    // Register extensions for the first plugin
    reactiveRegistry.register({
      pluginId: pluginId1,
      extensionConfigs: [
        {
          type: PluginExtensionTypes.link,
          title: 'Link 1',
          description: 'Link 1 description',
          path: `/a/${pluginId1}/declare-incident`,
          extensionPointId: 'grafana/dashboard/panel/menu',
          configure: jest.fn().mockReturnValue({}),
        },
      ],
    });

    const registry1 = await reactiveRegistry.getRegistry();

    expect(registry1).toEqual({
      'grafana/dashboard/panel/menu': [
        {
          pluginId: pluginId1,
          config: {
            type: PluginExtensionTypes.link,
            title: 'Link 1',
            description: 'Link 1 description',
            path: `/a/${pluginId1}/declare-incident`,
            extensionPointId: 'grafana/dashboard/panel/menu',
            configure: expect.any(Function),
          },
        },
      ],
    });

    // Register extensions for the second plugin to a different placement
    reactiveRegistry.register({
      pluginId: pluginId2,
      extensionConfigs: [
        {
          type: PluginExtensionTypes.link,
          title: 'Link 2',
          description: 'Link 2 description',
          path: `/a/${pluginId2}/declare-incident`,
          extensionPointId: 'grafana/dashboard/panel/menu',
          configure: jest.fn().mockReturnValue({}),
        },
      ],
    });

    const registry2 = await reactiveRegistry.getRegistry();

    expect(registry2).toEqual({
      'grafana/dashboard/panel/menu': [
        {
          pluginId: pluginId1,
          config: {
            type: PluginExtensionTypes.link,
            title: 'Link 1',
            description: 'Link 1 description',
            path: `/a/${pluginId1}/declare-incident`,
            extensionPointId: 'grafana/dashboard/panel/menu',
            configure: expect.any(Function),
          },
        },
        {
          pluginId: pluginId2,
          config: {
            type: PluginExtensionTypes.link,
            title: 'Link 2',
            description: 'Link 2 description',
            path: `/a/${pluginId2}/declare-incident`,
            extensionPointId: 'grafana/dashboard/panel/menu',
            configure: expect.any(Function),
          },
        },
      ],
    });
  });

  it('should be possible to asynchronously register extensions for a different placement (different plugin)', async () => {
    const pluginId1 = 'grafana-basic-app';
    const pluginId2 = 'grafana-basic-app2';
    const reactiveRegistry = new ReactivePluginExtenionRegistry();

    // Register extensions for the first plugin
    reactiveRegistry.register({
      pluginId: pluginId1,
      extensionConfigs: [
        {
          type: PluginExtensionTypes.link,
          title: 'Link 1',
          description: 'Link 1 description',
          path: `/a/${pluginId1}/declare-incident`,
          extensionPointId: 'grafana/dashboard/panel/menu',
          configure: jest.fn().mockReturnValue({}),
        },
      ],
    });

    const registry1 = await reactiveRegistry.getRegistry();

    expect(registry1).toEqual({
      'grafana/dashboard/panel/menu': [
        {
          pluginId: pluginId1,
          config: {
            type: PluginExtensionTypes.link,
            title: 'Link 1',
            description: 'Link 1 description',
            path: `/a/${pluginId1}/declare-incident`,
            extensionPointId: 'grafana/dashboard/panel/menu',
            configure: expect.any(Function),
          },
        },
      ],
    });

    // Register extensions for the second plugin to a different placement
    reactiveRegistry.register({
      pluginId: pluginId2,
      extensionConfigs: [
        {
          type: PluginExtensionTypes.link,
          title: 'Link 2',
          description: 'Link 2 description',
          path: `/a/${pluginId2}/declare-incident`,
          extensionPointId: 'plugins/myorg-basic-app/start',
          configure: jest.fn().mockReturnValue({}),
        },
      ],
    });

    const registry2 = await reactiveRegistry.getRegistry();

    expect(registry2).toEqual({
      'grafana/dashboard/panel/menu': [
        {
          pluginId: pluginId1,
          config: {
            type: PluginExtensionTypes.link,
            title: 'Link 1',
            description: 'Link 1 description',
            path: `/a/${pluginId1}/declare-incident`,
            extensionPointId: 'grafana/dashboard/panel/menu',
            configure: expect.any(Function),
          },
        },
      ],
      'plugins/myorg-basic-app/start': [
        {
          pluginId: pluginId2,
          config: {
            type: PluginExtensionTypes.link,
            title: 'Link 2',
            description: 'Link 2 description',
            path: `/a/${pluginId2}/declare-incident`,
            extensionPointId: 'plugins/myorg-basic-app/start',
            configure: expect.any(Function),
          },
        },
      ],
    });
  });

  it('should be possible to asynchronously register extensions for the same placement (same plugin)', async () => {
    const pluginId = 'grafana-basic-app';
    const reactiveRegistry = new ReactivePluginExtenionRegistry();

    // Register extensions for the first extension point
    reactiveRegistry.register({
      pluginId: pluginId,
      extensionConfigs: [
        {
          type: PluginExtensionTypes.link,
          title: 'Link 1',
          description: 'Link 1 description',
          path: `/a/${pluginId}/declare-incident-1`,
          extensionPointId: 'grafana/dashboard/panel/menu',
          configure: jest.fn().mockReturnValue({}),
        },
      ],
    });

    // Register extensions to a different extension point
    reactiveRegistry.register({
      pluginId: pluginId,
      extensionConfigs: [
        {
          type: PluginExtensionTypes.link,
          title: 'Link 2',
          description: 'Link 2 description',
          path: `/a/${pluginId}/declare-incident-2`,
          extensionPointId: 'grafana/dashboard/panel/menu',
          configure: jest.fn().mockReturnValue({}),
        },
      ],
    });

    const registry2 = await reactiveRegistry.getRegistry();

    expect(registry2).toEqual({
      'grafana/dashboard/panel/menu': [
        {
          pluginId: pluginId,
          config: {
            type: PluginExtensionTypes.link,
            title: 'Link 1',
            description: 'Link 1 description',
            path: `/a/${pluginId}/declare-incident-1`,
            extensionPointId: 'grafana/dashboard/panel/menu',
            configure: expect.any(Function),
          },
        },
        {
          pluginId: pluginId,
          config: {
            type: PluginExtensionTypes.link,
            title: 'Link 2',
            description: 'Link 2 description',
            path: `/a/${pluginId}/declare-incident-2`,
            extensionPointId: 'grafana/dashboard/panel/menu',
            configure: expect.any(Function),
          },
        },
      ],
    });
  });

  it('should be possible to asynchronously register extensions for a different placement (same plugin)', async () => {
    const pluginId = 'grafana-basic-app';
    const reactiveRegistry = new ReactivePluginExtenionRegistry();

    // Register extensions for the first extension point
    reactiveRegistry.register({
      pluginId: pluginId,
      extensionConfigs: [
        {
          type: PluginExtensionTypes.link,
          title: 'Link 1',
          description: 'Link 1 description',
          path: `/a/${pluginId}/declare-incident`,
          extensionPointId: 'grafana/dashboard/panel/menu',
          configure: jest.fn().mockReturnValue({}),
        },
      ],
    });

    // Register extensions to a different extension point
    reactiveRegistry.register({
      pluginId: pluginId,
      extensionConfigs: [
        {
          type: PluginExtensionTypes.link,
          title: 'Link 2',
          description: 'Link 2 description',
          path: `/a/${pluginId}/declare-incident`,
          extensionPointId: 'plugins/myorg-basic-app/start',
          configure: jest.fn().mockReturnValue({}),
        },
      ],
    });

    const registry2 = await reactiveRegistry.getRegistry();

    expect(registry2).toEqual({
      'grafana/dashboard/panel/menu': [
        {
          pluginId: pluginId,
          config: {
            type: PluginExtensionTypes.link,
            title: 'Link 1',
            description: 'Link 1 description',
            path: `/a/${pluginId}/declare-incident`,
            extensionPointId: 'grafana/dashboard/panel/menu',
            configure: expect.any(Function),
          },
        },
      ],
      'plugins/myorg-basic-app/start': [
        {
          pluginId: pluginId,
          config: {
            type: PluginExtensionTypes.link,
            title: 'Link 2',
            description: 'Link 2 description',
            path: `/a/${pluginId}/declare-incident`,
            extensionPointId: 'plugins/myorg-basic-app/start',
            configure: expect.any(Function),
          },
        },
      ],
    });
  });

  it('should notify subscribers when the registry changes', async () => {
    const pluginId = 'grafana-basic-app';
    const reactiveRegistry = new ReactivePluginExtenionRegistry();
    const observable = reactiveRegistry.asObservable();
    const subscribeCallback = jest.fn();

    observable.subscribe(subscribeCallback);

    // Register extensions for the first plugin
    reactiveRegistry.register({
      pluginId: pluginId,
      extensionConfigs: [
        {
          type: PluginExtensionTypes.link,
          title: 'Link 1',
          description: 'Link 1 description',
          path: `/a/${pluginId}/declare-incident`,
          extensionPointId: 'grafana/dashboard/panel/menu',
          configure: jest.fn().mockReturnValue({}),
        },
      ],
    });

    expect(subscribeCallback).toHaveBeenCalledTimes(2);

    // Register extensions for the first plugin
    reactiveRegistry.register({
      pluginId: 'another-plugin',
      extensionConfigs: [
        {
          type: PluginExtensionTypes.link,
          title: 'Link 1',
          description: 'Link 1 description',
          path: `/a/another-plugin/declare-incident`,
          extensionPointId: 'grafana/dashboard/panel/menu',
          configure: jest.fn().mockReturnValue({}),
        },
      ],
    });

    expect(subscribeCallback).toHaveBeenCalledTimes(3);

    const registry = subscribeCallback.mock.calls[2][0];

    expect(registry).toEqual({
      'grafana/dashboard/panel/menu': [
        {
          pluginId: pluginId,
          config: {
            type: PluginExtensionTypes.link,
            title: 'Link 1',
            description: 'Link 1 description',
            path: `/a/${pluginId}/declare-incident`,
            extensionPointId: 'grafana/dashboard/panel/menu',
            configure: expect.any(Function),
          },
        },
        {
          pluginId: 'another-plugin',
          config: {
            type: PluginExtensionTypes.link,
            title: 'Link 1',
            description: 'Link 1 description',
            path: `/a/another-plugin/declare-incident`,
            extensionPointId: 'grafana/dashboard/panel/menu',
            configure: expect.any(Function),
          },
        },
      ],
    });
  });

  it('should give the last version of the registry for new subscribers', async () => {
    const pluginId = 'grafana-basic-app';
    const reactiveRegistry = new ReactivePluginExtenionRegistry();
    const observable = reactiveRegistry.asObservable();
    const subscribeCallback = jest.fn();

    reactiveRegistry.register({
      pluginId: pluginId,
      extensionConfigs: [
        {
          type: PluginExtensionTypes.link,
          title: 'Link 1',
          description: 'Link 1 description',
          path: `/a/${pluginId}/declare-incident`,
          extensionPointId: 'grafana/dashboard/panel/menu',
          configure: jest.fn().mockReturnValue({}),
        },
      ],
    });

    observable.subscribe(subscribeCallback);
    expect(subscribeCallback).toHaveBeenCalledTimes(1);

    const registry = subscribeCallback.mock.calls[0][0];

    expect(registry).toEqual({
      'grafana/dashboard/panel/menu': [
        {
          pluginId: pluginId,
          config: {
            type: PluginExtensionTypes.link,
            title: 'Link 1',
            description: 'Link 1 description',
            path: `/a/${pluginId}/declare-incident`,
            extensionPointId: 'grafana/dashboard/panel/menu',
            configure: expect.any(Function),
          },
        },
      ],
    });
  });

  it('should not register extensions for a plugin that had errors', () => {
    const pluginId = 'grafana-basic-app';
    const reactiveRegistry = new ReactivePluginExtenionRegistry();
    const observable = reactiveRegistry.asObservable();
    const subscribeCallback = jest.fn();

    reactiveRegistry.register({
      error: new Error('Something is broken'),
      pluginId: pluginId,
      extensionConfigs: [
        {
          type: PluginExtensionTypes.link,
          title: 'Link 1',
          description: 'Link 1 description',
          path: `/a/${pluginId}/declare-incident`,
          extensionPointId: 'grafana/dashboard/panel/menu',
          configure: jest.fn().mockReturnValue({}),
        },
      ],
    });

    observable.subscribe(subscribeCallback);
    expect(subscribeCallback).toHaveBeenCalledTimes(1);

    const registry = subscribeCallback.mock.calls[0][0];
    expect(registry).toEqual({});
  });

  it('should not register an extension if it has an invalid configure() function', () => {
    const pluginId = 'grafana-basic-app';
    const reactiveRegistry = new ReactivePluginExtenionRegistry();
    const observable = reactiveRegistry.asObservable();
    const subscribeCallback = jest.fn();

    reactiveRegistry.register({
      pluginId: pluginId,
      extensionConfigs: [
        {
          type: PluginExtensionTypes.link,
          title: 'Link 1',
          description: 'Link 1 description',
          path: `/a/${pluginId}/declare-incident`,
          extensionPointId: 'grafana/dashboard/panel/menu',
          //@ts-ignore
          configure: '...',
        },
      ],
    });

    observable.subscribe(subscribeCallback);
    expect(subscribeCallback).toHaveBeenCalledTimes(1);

    const registry = subscribeCallback.mock.calls[0][0];
    expect(registry).toEqual({});
  });

  it('should not register an extension if it has invalid properties (empty title / description)', () => {
    const pluginId = 'grafana-basic-app';
    const reactiveRegistry = new ReactivePluginExtenionRegistry();
    const observable = reactiveRegistry.asObservable();
    const subscribeCallback = jest.fn();

    reactiveRegistry.register({
      pluginId: pluginId,
      extensionConfigs: [
        {
          type: PluginExtensionTypes.link,
          title: '',
          description: '',
          path: `/a/${pluginId}/declare-incident`,
          extensionPointId: 'grafana/dashboard/panel/menu',
          configure: jest.fn().mockReturnValue({}),
        },
      ],
    });

    observable.subscribe(subscribeCallback);
    expect(subscribeCallback).toHaveBeenCalledTimes(1);

    const registry = subscribeCallback.mock.calls[0][0];
    expect(registry).toEqual({});
  });

  it('should not register link extensions with invalid path configured', () => {
    const pluginId = 'grafana-basic-app';
    const reactiveRegistry = new ReactivePluginExtenionRegistry();
    const observable = reactiveRegistry.asObservable();
    const subscribeCallback = jest.fn();

    reactiveRegistry.register({
      pluginId: pluginId,
      extensionConfigs: [
        {
          type: PluginExtensionTypes.link,
          title: 'Title 1',
          description: 'Description 1',
          path: `/a/another-plugin/declare-incident`,
          extensionPointId: 'grafana/dashboard/panel/menu',
          configure: jest.fn().mockReturnValue({}),
        },
      ],
    });

    observable.subscribe(subscribeCallback);
    expect(subscribeCallback).toHaveBeenCalledTimes(1);

    const registry = subscribeCallback.mock.calls[0][0];
    expect(registry).toEqual({});
  });
});
