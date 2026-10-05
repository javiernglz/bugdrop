# Security Policy

## Intentional Vulnerabilities
Bugdrop is a deliberately vulnerable web application designed for educational purposes, Capture The Flag (CTF) challenges, and Bug Bounty training. 

**DO NOT REPORT VULNERABILITIES FOUND IN THIS APPLICATION.**

The application contains intentional security flaws (including but not limited to XSS, SQL Injection, IDOR, Business Logic flaws, and Information Disclosure). These are documented features of the training environment.

## Deployment Warning
Because this application is extremely vulnerable by design, **NEVER** expose it to the public internet or an untrusted network. It should only be run locally bound to `127.0.0.1` (as configured by default in the `docker-compose.yml`) or inside an isolated virtual machine.

## Reporting Actual Security Issues
If you find a security issue in the *infrastructure* of the project (e.g., the Docker configuration, or a supply chain vulnerability in a dependency that could compromise the host machine running the container), please open an issue in the GitHub repository.

We welcome PRs that harden the Docker container or improve the isolation of the environment without breaking the CTF challenges.
