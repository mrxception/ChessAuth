"use client"
import { useState } from "react"
import Link from "next/link"
import { ModernLayout } from "@/components/modern-layout"
import { ModernCard } from "@/components/modern-card"
import { Button } from "@/components/ui/button"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Shield,
  Zap,
  Crown,
  Lock,
  Users,
  BarChart3,
  ArrowRight,
  CheckCircle,
  Rocket,
  Database,
  ChevronRight,
  Play,
  Copy,
  Check,
} from "lucide-react"

const codeExamples = {
  javascript: {
    name: "JavaScript",
    icon: "🟨",
    code: `const response = await fetch('/api/v1/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    public_key: "pk_chess_...",
    secret_key: "sk_chess_...",
    username: "player1",
    password: "secure123",
    hwid: "unique-hardware-id"
  })
});

const data = await response.json();
console.log(data);`,
    response: `{
  "success": true,
  "message": "Login successful",
  "data": {
    "username": "player1",
    "subscription": "pro",
    "expires_at": "2024-12-31"
  }
}`,
  },
  python: {
    name: "Python",
    icon: "🐍",
    code: `import requests
import json

# Authentication request
response = requests.post('/api/v1/login', json={
    "public_key": "pk_chess_...",
    "secret_key": "sk_chess_...",
    "username": "player1",
    "password": "secure123",
    "hwid": "unique-hardware-id"
})

data = response.json()
print(json.dumps(data, indent=2))`,
    response: `{
  "success": true,
  "message": "Login successful",
  "data": {
    "username": "player1",
    "subscription": "pro",
    "expires_at": "2024-12-31"
  }
}`,
  },
  php: {
    name: "PHP",
    icon: "🐘",
    code: `<?php
$data = array(
    'public_key' => 'pk_chess_...',
    'secret_key' => 'sk_chess_...',
    'username' => 'player1',
    'password' => 'secure123',
    'hwid' => 'unique-hardware-id'
);

$options = array(
    'http' => array(
        'header' => "Content-type: application/json\\r\\n",
        'method' => 'POST',
        'content' => json_encode($data)
    )
);

$context = stream_context_create($options);
$result = file_get_contents('/api/v1/login', false, $context);
$response = json_decode($result, true);

print_r($response);
?>`,
    response: `{
  "success": true,
  "message": "Login successful",
  "data": {
    "username": "player1",
    "subscription": "pro",
    "expires_at": "2024-12-31"
  }
}`,
  },
  csharp: {
    name: "C#",
    icon: "💜",
    code: `using System;
using System.Net.Http;
using System.Text;
using System.Text.Json;

var client = new HttpClient();
var data = new {
    public_key = "pk_chess_...",
    secret_key = "sk_chess_...",
    username = "player1",
    password = "secure123",
    hwid = "unique-hardware-id"
};

var json = JsonSerializer.Serialize(data);
var content = new StringContent(json, Encoding.UTF8, "application/json");

var response = await client.PostAsync("/api/v1/login", content);
var result = await response.Content.ReadAsStringAsync();

Console.WriteLine(result);`,
    response: `{
  "success": true,
  "message": "Login successful",
  "data": {
    "username": "player1",
    "subscription": "pro",
    "expires_at": "2024-12-31"
  }
}`,
  },
  go: {
    name: "Go",
    icon: "🐹",
    code: `package main

import "bytes"
import "encoding/json"
import "fmt"
import "net/http"

func main() {
    data := map[string]string{
        "public_key": "pk_chess_...",
        "secret_key": "sk_chess_...",
        "username": "player1",
        "password": "secure123",
        "hwid": "unique-hardware-id",
    }
    
    jsonData, _ := json.Marshal(data)
    resp, err := http.Post("/api/v1/login",
    "application/json", bytes.NewBuffer(jsonData))
    
    if err != nil {
        panic(err)
    }
    defer resp.Body.Close()
    
    fmt.Println("Response received")
}`,
    response: `{
  "success": true,
  "message": "Login successful",
  "data": {
    "username": "player1",
    "subscription": "pro",
    "expires_at": "2024-12-31"
  }
}`,
  },
  java: {
    name: "Java",
    icon: "☕",
    code: `import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.URI;

public class ChessAuthExample {
    public static void main(String[] args) throws Exception {
        String json = """
        {
            "public_key": "pk_chess_...",
            "secret_key": "sk_chess_...",
            "username": "player1",
            "password": "secure123",
            "hwid": "unique-hardware-id"
        }
        """;

        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create("/api/v1/login"))
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(json))
            .build();

        HttpResponse<String> response = client.send(request,
            HttpResponse.BodyHandlers.ofString());
        System.out.println(response.body());
    }
}`,
    response: `{
  "success": true,
  "message": "Login successful",
  "data": {
    "username": "player1",
    "subscription": "pro",
    "expires_at": "2024-12-31"
  }
}`,
  },
  cpp: {
    name: "C++",
    icon: "🔷",
    code: `#include <iostream>
#include <string>
#include <cpprest/http_client.h>
#include <cpprest/json.h>

using namespace web;
using namespace web::http;
using namespace web::http::client;

int main() {
    try {
        http_client client(U("/api/v1/login"));
        json::value data;
        data[U("public_key")] = json::value::string(U("pk_chess_..."));
        data[U("secret_key")] = json::value::string(U("sk_chess_..."));
        data[U("username")] = json::value::string(U("player1"));
        data[U("password")] = json::value::string(U("secure123"));
        data[U("hwid")] = json::value::string(U("unique-hardware-id"));

        http_request request(methods::POST);
        request.headers().set_content_type(U("application/json"));
        request.set_body(data);

        client.request(request).then([](http_response response) {
            if (response.status_code() == status_codes::OK) {
                return response.extract_json();
            }
            return pplx::task_from_result(json::value());
        }).then([](json::value body) {
            std::wcout << body.serialize() << std::endl;
        }).wait();
    }
    catch (const std::exception& e) {
        std::cerr << "Error: " << e.what() << std::endl;
    }
    return 0;
}`,
    response: `{
  "success": true,
  "message": "Login successful",
  "data": {
    "username": "player1",
    "subscription": "pro",
    "expires_at": "2024-12-31"
  }
}`,
  },
  rust: {
    name: "Rust",
    icon: "🦀",
    code: `use reqwest;
use serde_json::json;
use std::collections::HashMap;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let mut data = HashMap::new();
    data.insert("public_key", "pk_chess_...");
    data.insert("secret_key", "sk_chess_...");
    data.insert("username", "player1");
    data.insert("password", "secure123");
    data.insert("hwid", "unique-hardware-id");

    let client = reqwest::Client::new();
    let response = client
        .post("/api/v1/login")
        .json(&data)
        .send()
        .await?;

    let result: serde_json::Value = response.json().await?;
    println!("{}", serde_json::to_string_pretty(&result)?);
    
    Ok(())
}`,
    response: `{
  "success": true,
  "message": "Login successful",
  "data": {
    "username": "player1",
    "subscription": "pro",
    "expires_at": "2024-12-31"
  }
}`,
  },
}

const features = [
  {
    icon: Lock,
    title: "Military-Grade Security",
    description: "Advanced encryption, secure password hashing, and JWT authentication to protect your users.",
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-500/20",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Optimized API endpoints with sub-100ms response times. Built for scale and performance.",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
  },
  {
    icon: Users,
    title: "User Management",
    description: "Complete user lifecycle management with HWID locking, subscription handling, and ban systems.",
    color: "text-green-400",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/20",
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description: "Detailed logs, usage statistics, and real-time monitoring for all your applications.",
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/20",
  },
  {
    icon: Shield,
    title: "HWID Protection",
    description: "Hardware ID locking and validation to prevent unauthorized access and account sharing.",
    color: "text-red-400",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/20",
  },
  {
    icon: Crown,
    title: "Easy Integration",
    description: "Simple REST API with comprehensive documentation. Get up and running in minutes.",
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-500/20",
  },
]

function SyntaxHighlighter({ code, language }: { code: string; language: string }) {
  const lines = code.split("\n")

  const getTokenColor = (token: string, lang: string): string => {
    const keywords = {
      javascript: [
        "const",
        "let",
        "var",
        "function",
        "async",
        "await",
        "import",
        "export",
        "return",
        "if",
        "else",
        "for",
        "while",
        "try",
        "catch",
      ],
      python: [
        "import",
        "def",
        "class",
        "if",
        "else",
        "elif",
        "for",
        "while",
        "return",
        "print",
        "async",
        "await",
        "from",
        "as",
      ],
      php: ["function", "class", "if", "else", "foreach", "return", "echo", "array", "new"],
      csharp: ["using", "var", "public", "private", "class", "static", "async", "await", "new", "if", "else", "return"],
      go: ["package", "import", "func", "var", "if", "else", "for", "return", "defer"],
      java: ["public", "private", "class", "static", "import", "new", "if", "else", "return", "String", "void"],
      cpp: ["include", "using", "namespace", "int", "try", "catch", "return", "std", "cout", "cerr"],
      rust: ["use", "fn", "let", "mut", "if", "else", "match", "async", "await", "pub", "struct", "impl"],
    }

    const langKeywords = keywords[lang as keyof typeof keywords] || []
    if (langKeywords.includes(token)) {
      return "text-purple-400"
    }

    if (
      (token.startsWith('"') && token.endsWith('"')) ||
      (token.startsWith("'") && token.endsWith("'")) ||
      (token.startsWith("`") && token.endsWith("`"))
    ) {
      return "text-green-300"
    }

    if (/^\d+\.?\d*$/.test(token)) {
      return "text-orange-400"
    }

    if (token.startsWith("//") || token.startsWith("#")) {
      return "text-gray-500"
    }

    if (lang === "json" && token.startsWith('"') && token.endsWith('":')) {
      return "text-blue-300"
    }

    return "text-gray-300"
  }

  const tokenizeLine = (line: string, lang: string) => {
    const tokens = line.split(/(\s+|[{}()[\],.;:=<>!&|+\-*/])/).filter((token) => token.length > 0)
    return tokens.map((token, index) => {
      const color = getTokenColor(token.trim(), lang)
      return (
        <span key={index} className={color}>
          {token}
        </span>
      )
    })
  }

  return (
    <pre className="font-mono text-sm leading-6 whitespace-pre overflow-x-auto">
      <code>
        {lines.map((line, index) => (
          <div key={index}>{line.trim() === "" ? "\u00A0" : tokenizeLine(line, language)}</div>
        ))}
      </code>
    </pre>
  )
}

export default function HomePage() {
  const [selectedLanguage, setSelectedLanguage] = useState<keyof typeof codeExamples>("javascript")
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({})

  const copyToClipboard = (text: string, buttonId: string) => {
    navigator.clipboard.writeText(text)

    // Set the copied state for this specific button
    setCopiedStates((prev) => ({ ...prev, [buttonId]: true }))

    // Reset after 3 seconds
    setTimeout(() => {
      setCopiedStates((prev) => ({ ...prev, [buttonId]: false }))
    }, 3000)
  }

  return (
    <ModernLayout>
      <div className="space-y-32">
        {/* Hero Section */}
        <section className="relative text-center space-y-12 py-20 overflow-hidden">
          <div className="space-y-8">
            <div className="flex justify-center items-center space-x-4 mb-8">
              <Crown className="h-16 w-16 md:h-20 md:w-20 text-yellow-500 chess-float" />
              <Shield
                className="h-12 w-12 md:h-16 md:w-16 text-yellow-400 chess-float"
                style={{ animationDelay: "0.5s" }}
              />
              <Zap className="h-14 w-14 md:h-18 md:w-18 text-yellow-300 chess-float" style={{ animationDelay: "1s" }} />
            </div>
            <div className="space-y-6">
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold gradient-text leading-tight">ChessAuth</h1>
              <p className="text-xl md:text-2xl lg:text-3xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
                The most <span className="text-yellow-500 font-semibold">advanced authentication platform</span> for
                modern developers.
                <br />
                <span className="text-gray-400 text-lg md:text-xl">Secure, scalable, and easy to use.</span>
              </p>
            </div>
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-8">
              <Link href="/register">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold px-8 py-4 text-lg hover-glow transform hover:scale-105 transition-all duration-200"
                >
                  <Rocket className="mr-2 h-5 w-5" />
                  Start Building Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10 hover:border-yellow-500 px-8 py-4 text-lg bg-transparent backdrop-blur-sm transition-all duration-300"
                >
                  <Shield className="mr-2 h-5 w-5" />
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold gradient-text">Why Choose ChessAuth?</h2>
            <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
              Professional-grade features designed for modern applications
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <ModernCard
                key={index}
                className={`group hover:${feature.borderColor} transition-all duration-300 hover:scale-105`}
              >
                <CardHeader className="text-center pb-4">
                  <div
                    className={`mx-auto mb-4 p-4 ${feature.bgColor} rounded-full w-fit group-hover:scale-110 transition-transform duration-300`}
                  >
                    <feature.icon className={`h-8 w-8 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-xl gradient-text">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-300 leading-relaxed">{feature.description}</p>
                </CardContent>
              </ModernCard>
            ))}
          </div>
        </section>

        {/* API Example with Language Selection */}
        <section className="space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold gradient-text">Simple API Integration</h2>
            <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
              Get started with just a few lines of code in your favorite language
            </p>
          </div>

          {/* Language Selector */}
          <div className="flex justify-center">
            <div className="flex flex-wrap gap-2 p-3 bg-black/30 rounded-xl border border-yellow-500/20 backdrop-blur-sm max-w-4xl">
              {Object.entries(codeExamples).map(([key, lang]) => (
                <Button
                  key={key}
                  variant={selectedLanguage === key ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSelectedLanguage(key as keyof typeof codeExamples)}
                  className={`${
                    selectedLanguage === key
                      ? "bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-semibold"
                      : "text-gray-300 hover:text-white hover:bg-gray-800"
                  } transition-all duration-200 flex items-center gap-2`}
                >
                  <span className="text-sm">{lang.icon}</span>
                  <span className="hidden sm:inline">{lang.name}</span>
                  <span className="sm:hidden">{lang.name.slice(0, 3)}</span>
                </Button>
              ))}
            </div>
          </div>

          <ModernCard className="max-w-7xl mx-auto overflow-hidden border border-yellow-500/20">
            <CardContent className="p-0">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                {/* Request Side */}
                <div className="relative">
                  {/* Editor Header */}
                  <div className="flex items-center justify-between px-6 py-3 bg-gray-900/50 border-b border-gray-700/50">
                    <div className="flex items-center space-x-3">
                      <div className="flex space-x-1">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Play className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm font-medium text-yellow-500">
                          {codeExamples[selectedLanguage].name} Request
                        </span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        copyToClipboard(codeExamples[selectedLanguage].code, `request-${selectedLanguage}`)
                      }
                      className={`transition-all duration-200 ${
                        copiedStates[`request-${selectedLanguage}`]
                          ? "text-green-400 hover:text-green-300"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      {copiedStates[`request-${selectedLanguage}`] ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {/* Code Content */}
                  <div className="relative">
                    <div className="bg-gray-900/20 p-6 text-sm overflow-x-auto min-h-[400px]">
                      <SyntaxHighlighter code={codeExamples[selectedLanguage].code} language={selectedLanguage} />
                    </div>
                  </div>
                </div>

                {/* Response Side */}
                <div className="relative border-l border-gray-700/50">
                  {/* Editor Header */}
                  <div className="flex items-center justify-between px-6 py-3 bg-gray-900/50 border-b border-gray-700/50">
                    <div className="flex items-center space-x-3">
                      <div className="flex space-x-1">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Database className="h-4 w-4 text-blue-400" />
                        <span className="text-sm font-medium text-blue-400">JSON Response</span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        copyToClipboard(codeExamples[selectedLanguage].response, `response-${selectedLanguage}`)
                      }
                      className={`transition-all duration-200 ${
                        copiedStates[`response-${selectedLanguage}`]
                          ? "text-green-400 hover:text-green-300"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      {copiedStates[`response-${selectedLanguage}`] ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {/* Code Content */}
                  <div className="relative">
                    <div className="bg-gray-900/20 p-6 text-sm overflow-x-auto min-h-[400px]">
                      <SyntaxHighlighter code={codeExamples[selectedLanguage].response} language="json" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Integration Note */}
              <div className="p-6 bg-gradient-to-r from-yellow-500/10 to-blue-500/10 border-t border-yellow-500/20">
                <div className="flex items-start space-x-3">
                  <Crown className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-yellow-500 font-semibold mb-1">Quick Start Tip</h4>
                    <p className="text-gray-300 text-sm">
                      Copy your API keys from the dashboard and replace the placeholder values. The HWID can be
                      generated using our client libraries or your own hardware fingerprinting.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </ModernCard>
        </section>

        {/* Features Checklist */}
        <section className="space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold gradient-text">Everything You Need</h2>
            <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
              Professional authentication made simple and powerful
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              "JWT Token Authentication",
              "Hardware ID Locking",
              "Subscription Management",
              "User Ban System",
              "Real-time Analytics",
              "Custom Error Messages",
              "API Rate Limiting",
              "Detailed Logging",
              "Multi-App Support",
              "Secure Password Hashing",
              "Session Management",
              "RESTful API Design",
            ].map((feature, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 p-4 rounded-lg bg-gray-800/20 border border-gray-700/50 hover:border-yellow-500/30 transition-colors duration-300"
              >
                <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                <span className="text-gray-300">{feature}</span>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center space-y-8 py-20">
          <div className="space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold gradient-text">Ready to Get Started?</h2>
            <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
              Join thousands of developers who trust ChessAuth for their authentication needs.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link href="/register">
              <Button
                size="lg"
                className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold px-8 py-4 text-lg hover-glow transform hover:scale-105 transition-all duration-200"
              >
                <Crown className="mr-2 h-5 w-5" />
                Create Free Account
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </ModernLayout>
  )
}