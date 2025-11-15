# 🤝 Contributing to Inventory Analytics System

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)

---

## 📜 Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive experience for everyone. We expect all contributors to:

- Be respectful and inclusive
- Accept constructive criticism gracefully
- Focus on what's best for the community
- Show empathy towards other community members

### Unacceptable Behavior

- Harassment, trolling, or insulting comments
- Publishing others' private information
- Any conduct that could be considered inappropriate in a professional setting

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Python 3.9+
- MySQL 8.0+
- Git
- Basic knowledge of React/Next.js and FastAPI

### Fork and Clone

1. **Fork the repository** on GitHub
2. **Clone your fork:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/inventory-system.git
   cd inventory-system
   ```

3. **Add upstream remote:**
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/inventory-system.git
   ```

---

## 💻 Development Setup

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt

# Install dev dependencies
pip install pytest black flake8 mypy

# Setup pre-commit hooks
pip install pre-commit
pre-commit install

# Create .env file
cp .env.example .env
# Edit .env with your local MySQL credentials

# Create database
mysql -u root -p -e "CREATE DATABASE inventory_db_dev;"

# Run the server
python main.py
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Install dev dependencies (if not in package.json)
npm install -D @types/node @types/react

# Create .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Run development server
npm run dev
```

---

## 🔨 How to Contribute

### Types of Contributions

We welcome:

- 🐛 **Bug fixes**
- ✨ **New features**
- 📝 **Documentation improvements**
- 🎨 **UI/UX enhancements**
- ⚡ **Performance optimizations**
- 🧪 **Test coverage improvements**

### Finding Issues to Work On

1. Check the [Issues page](https://github.com/yourusername/inventory-system/issues)
2. Look for issues labeled:
   - `good first issue` - Great for newcomers
   - `help wanted` - Need community assistance
   - `bug` - Bug fixes needed
   - `enhancement` - New features

### Before You Start

1. **Check if the issue exists** - Search existing issues
2. **Comment on the issue** - Let others know you're working on it
3. **Create a new issue** - If the bug/feature isn't reported yet
4. **Wait for approval** - Especially for major changes

---

## 📏 Coding Standards

### Python (Backend)

**Style Guide:** Follow PEP 8

```bash
# Format code
black main.py

# Check linting
flake8 main.py

# Type checking
mypy main.py
```

**Key Conventions:**
- Use type hints for all functions
- Maximum line length: 100 characters
- Use descriptive variable names
- Add docstrings for all public functions

**Example:**
```python
from typing import List, Optional
from pydantic import BaseModel

def get_products(
    db: Session,
    skip: int = 0,
    limit: int = 100
) -> List[Product]:
    """
    Retrieve a list of products from the database.
    
    Args:
        db: Database session
        skip: Number of records to skip (for pagination)
        limit: Maximum number of records to return
        
    Returns:
        List of Product objects
    """
    return db.query(Product).offset(skip).limit(limit).all()
```

### TypeScript (Frontend)

**Style Guide:** Follow Airbnb React/TypeScript Style Guide

```bash
# Format code
npm run lint

# Fix automatically
npm run lint:fix
```

**Key Conventions:**
- Use functional components with hooks
- Use TypeScript interfaces for props
- Use meaningful component names
- Extract reusable logic into custom hooks

**Example:**
```typescript
interface ProductCardProps {
  product: Product;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
}

export function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
  const handleEdit = () => {
    if (onEdit) onEdit(product.id);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{product.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Stock: {product.stock}</p>
      </CardContent>
    </Card>
  );
}
```

---

## 📝 Commit Guidelines

### Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**

```bash
feat(products): add export to CSV functionality

Add ability to export product list to CSV format.
Includes error handling and loading states.

Closes #123

---

fix(auth): resolve token expiration issue

Token was expiring too quickly due to incorrect
time calculation. Now uses UTC properly.

Fixes #456

---

docs(readme): update deployment instructions

Added detailed AWS deployment steps and
troubleshooting guide.
```

### Commit Best Practices

- Write clear, concise commit messages
- Make atomic commits (one logical change per commit)
- Test your changes before committing
- Don't commit generated files or dependencies

---

## 🔀 Pull Request Process

### 1. Create a Feature Branch

```bash
# Update your fork
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

### 2. Make Your Changes

- Write clean, readable code
- Follow coding standards
- Add tests for new features
- Update documentation

### 3. Test Your Changes

**Backend:**
```bash
# Run tests
pytest

# Check code quality
black .
flake8 .
mypy .
```

**Frontend:**
```bash
# Run tests
npm test

# Check types
npm run type-check

# Lint
npm run lint
```

### 4. Commit Your Changes

```bash
git add .
git commit -m "feat(scope): description"
```

### 5. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 6. Open Pull Request

1. Go to the original repository on GitHub
2. Click "New Pull Request"
3. Select your branch
4. Fill in the PR template:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
Describe how you tested your changes

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests added/updated
- [ ] All tests passing
```

### 7. Code Review

- Address review comments promptly
- Make requested changes in new commits
- Don't force push after review started
- Be open to feedback

### 8. Merge

Once approved:
- Maintainers will merge your PR
- Your branch will be deleted
- You can delete your local branch:
  ```bash
  git branch -d feature/your-feature-name
  ```

---

## 🧪 Testing Guidelines

### Backend Tests

```python
# tests/test_products.py
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_create_product():
    response = client.post(
        "/products",
        json={
            "name": "Test Product",
            "category": "Electronics",
            "unit_price": 99.99,
            "stock": 100,
            "threshold": 10
        }
    )
    assert response.status_code == 200
    assert response.json()["name"] == "Test Product"
```

### Frontend Tests

```typescript
// __tests__/ProductCard.test.tsx
import { render, screen } from '@testing-library/react';
import { ProductCard } from '@/components/ProductCard';

describe('ProductCard', () => {
  it('renders product information', () => {
    const product = {
      id: 1,
      name: 'Test Product',
      stock: 100,
      unit_price: 99.99
    };

    render(<ProductCard product={product} />);
    
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('Stock: 100')).toBeInTheDocument();
  });
});
```

---

## 🐛 Reporting Bugs

### Before Reporting

1. Check if the bug has already been reported
2. Try to reproduce the bug
3. Gather relevant information

### Bug Report Template

```markdown
**Describe the bug**
Clear description of the bug

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen

**Screenshots**
If applicable, add screenshots

**Environment:**
- OS: [e.g., Windows 10]
- Browser: [e.g., Chrome 96]
- Version: [e.g., 1.0.0]

**Additional context**
Any other relevant information
```

---

## 💡 Feature Requests

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
Clear description of the problem

**Describe the solution you'd like**
What you want to happen

**Describe alternatives you've considered**
Other solutions you've thought about

**Additional context**
Mockups, examples, or references
```

---

## 📚 Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Git Best Practices](https://git-scm.com/book/en/v2)

---

## 🎯 Development Roadmap

Check our [Project Board](https://github.com/yourusername/inventory-system/projects) for:
- Planned features
- In-progress work
- Completed milestones

---

## 💬 Communication

- **GitHub Issues** - Bug reports and feature requests
- **GitHub Discussions** - General questions and ideas
- **Pull Requests** - Code contributions

---

## 🙏 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project documentation

---

**Thank you for contributing! 🎉**

Your efforts help make this project better for everyone.
