module.exports = {
    transform: {
        '^.+\\.jsx?$': 'babel-jest',
      },
      testEnvironment: 'node',
      moduleNameMapper: {
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
      },
      globalSetup: '<rootDir>/jest.setup.js',
      globalTeardown: '<rootDir>/jest.teardown.js',
      setupFilesAfterEnv: ["<rootDir>/__test__/setupFile.js"]
  };