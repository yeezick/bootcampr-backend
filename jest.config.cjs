module.exports = {
    transform: {
        '^.+\\.jsx?$': 'babel-jest',
      },
      testEnvironment: 'node',
      moduleNameMapper: {
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
      },
      testTimeout:60000,
  };