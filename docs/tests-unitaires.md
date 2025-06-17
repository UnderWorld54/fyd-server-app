# Tests Unitaires dans l'API FYD

## Introduction

Ce document explique l'implémentation des tests unitaires dans notre API FYD. Les tests unitaires sont essentiels pour garantir la qualité du code et la fiabilité de notre application.

## Technologies et Librairies Utilisées

### 1. Jest
- **Version**: 29.x
- **Description**: Framework de test JavaScript
- **Utilisation**: Framework principal pour l'exécution des tests
- **Installation**: `npm install --save-dev jest @types/jest`

### 2. ts-jest
- **Version**: 29.x
- **Description**: Processeur TypeScript pour Jest
- **Utilisation**: Permet d'exécuter des tests sur du code TypeScript
- **Installation**: `npm install --save-dev ts-jest`

### 3. @types/jest
- **Version**: 29.x
- **Description**: Types TypeScript pour Jest
- **Utilisation**: Fournit le support TypeScript pour Jest
- **Installation**: Inclus avec Jest

## Configuration

### 1. Configuration Jest (jest.config.js)
```javascript
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
};
```

### 2. Scripts NPM (package.json)
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:debug": "node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand"
  }
}
```

## Structure des Tests

### Organisation des Fichiers
```
src/
  __tests__/
    auth.controller.spec.ts
    ...
```

### Convention de Nommage
- Les fichiers de test sont nommés avec le suffixe `.spec.ts`
- Le nom du fichier correspond au fichier testé (ex: `auth.controller.spec.ts` pour `auth.controller.ts`)

## Exemple de Test : AuthController

### Structure d'un Test
```typescript
describe('AuthController', () => {
  // Configuration initiale
  beforeEach(() => {
    // Setup
  });

  // Groupes de tests
  describe('register', () => {
    // Tests individuels
    it('should register a new user successfully', async () => {
      // Arrange
      // Act
      // Assert
    });
  });
});
```

### Pattern AAA (Arrange, Act, Assert)
1. **Arrange** : Préparation des données et des mocks
2. **Act** : Exécution de la fonction testée
3. **Assert** : Vérification des résultats

### Mocks
- Utilisation de `jest.mock()` pour mocker les dépendances
- Création d'objets mock pour simuler les réponses des services

## Bonnes Pratiques

1. **Isolation des Tests**
   - Chaque test doit être indépendant
   - Utilisation de `beforeEach` pour réinitialiser l'état

2. **Nommage Clair**
   - Descriptions explicites des tests
   - Utilisation de `describe` pour grouper les tests logiquement

3. **Gestion des Mocks**
   - Mock des dépendances externes
   - Simulation des réponses attendues

4. **Assertions**
   - Vérification des résultats attendus
   - Test des cas positifs et négatifs

## Exécution des Tests

### Commandes Disponibles
- `npm test` : Exécute tous les tests
- `npm run test:watch` : Mode watch (tests automatiques lors des modifications)
- `npm run test:cov` : Tests avec rapport de couverture
- `npm run test:debug` : Tests en mode debug

### Rapport de Couverture
- Généré avec `npm run test:cov`
- Indique le pourcentage de code testé
- Identifie les parties non testées

## Exemple de Test Complet

```typescript
describe('register', () => {
  it('should register a new user successfully', async () => {
    // Arrange
    const mockUserData = {
      _id: '123',
      name: 'Test User',
      email: 'test@example.com',
      city: 'Paris',
      interests: ['sport']
    };

    const mockUser: Partial<IUserDocument> = {
      ...mockUserData,
      comparePassword: jest.fn().mockResolvedValue(true),
      toJSON: () => mockUserData
    };

    // Act
    await authController.register(mockRequest as Request, mockResponse as Response);

    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(201);
    expect(responseObject).toEqual({
      success: true,
      data: {
        user: mockUserData,
        token: mockToken,
      },
      message: 'User registered successfully',
    });
  });
});
```

## Avantages des Tests Unitaires

1. **Détection Précoce des Bugs**
   - Identification rapide des problèmes
   - Réduction des coûts de correction

2. **Documentation Vivante**
   - Les tests servent de documentation
   - Exemples d'utilisation du code

3. **Refactoring Sécurisé**
   - Confiance dans les modifications
   - Détection des régressions

4. **Qualité du Code**
   - Meilleure conception
   - Code plus maintenable

## Conclusion

Les tests unitaires sont un élément essentiel du développement de notre API. Ils garantissent la qualité du code et facilitent la maintenance. La configuration mise en place avec Jest et TypeScript permet une expérience de test robuste et efficace. 