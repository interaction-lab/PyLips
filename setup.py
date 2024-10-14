#!/usr/bin/env python
"""The setup script."""

from setuptools import find_packages, setup

with open("README.md", encoding="utf-8") as readme_file:
    readme = readme_file.read()

with open("HISTORY.md", encoding="utf-8") as history_file:
    history = history_file.read()

install_requires = [
    #web server
    "flask>=2.0.1",
    "flask-socketio>=5.1.1",
    "python-socketio>=5.11.1",
    "websocket-client>=1.7.0",
    "requests>=2.31.0",
    #TTS
    "boto3>=1.18.67",
    "pygame>=2.1.1",
    "py3-tts>=3.5",
    "allosaurus>=1.0.2",
    "soundfile>=0.12.1",
]

extras_require = {
    "dev": [
        "pip>=20.3",
        "pylint",
        "yapf",
        "pre-commit",

        # Testing
        "pytest==7.0.1",
        "pytest-cov==3.0.0",
        "pytest-benchmark==3.4.1",
        "pytest-xdist==2.5.0",

        # Documentation
        "myst-nb==0.17.1",
        "Sphinx==4.5.0",
        "sphinx-autobuild==2021.3.14",
        "sphinx-autodoc-typehints==1.18.2",
        "sphinx-codeautolink==0.12.1",
        "sphinx-copybutton==0.3.1",
        "sphinx-jinja2-compat==0.2.0",
        "sphinx-material==0.0.32",
        "sphinx-prompt==1.5.0",
        "sphinx-tabs==3.3.1",
        "sphinx-toolbox==3.1.0",
        "sphinxcontrib-applehelp==1.0.4",
        "sphinxcontrib-devhelp==1.0.2",
        "sphinxcontrib-htmlhelp==2.0.1",
        "sphinxcontrib-jsmath==1.0.1",
        "sphinxcontrib-qthelp==1.0.3",
        "sphinxcontrib-serializinghtml==1.1.5",
        "sphinx-rtd-theme==1.3.0rc1",

        # Distribution
        "bump2version==1.0.1",
        "wheel==0.40.0",
        "twine==4.0.2",
        "check-wheel-contents==0.4.0",
    ],
}

setup(
    author="Interaction Lab",
    author_email="dennler@usc.edu",
    classifiers=[
        "Development Status :: 2 - Pre-Alpha",
        "Intended Audience :: Developers",
        "Intended Audience :: Education",
        "Intended Audience :: Science/Research",
        "License :: OSI Approved :: MIT License",
        "Natural Language :: English",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Programming Language :: Python :: 3.12",
        "Topic :: Software Development :: User Interfaces",
        "Topic :: Communications :: Chat",
        "Topic :: Scientific/Engineering :: Human Machine Interfaces",
    ],
    description=
    "An interface for embodied conversational interaction.",
    install_requires=install_requires,
    extras_require=extras_require,
    license="MIT license",
    long_description=readme + "\n\n" + history,
    long_description_content_type="text/markdown",
    include_package_data=True,
    keywords=["lipsynch", "robot", "interaction", "conversational", "agent"],
    name="pylips",
    packages=find_packages(include=["pylips", "pylips.*"]),
    python_requires=">=3.8.0",
    test_suite="tests",
    url="https://github.com/interaction-lab/PyLips",
    version="0.0.15",
    zip_safe=False,
)