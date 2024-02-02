module.exports = {
    transform: {
        '^.+\\.jsx?$': 'babel-jest',
      },
      testEnvironment: 'node',
      moduleNameMapper: {
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
        '\\.(png)$': '<rootDir>/__test__/user/__mocks__/imageMock.js'
      },
      testTimeout:30000,
  };