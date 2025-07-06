"use client"
import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { ModernLayout } from "@/components/modern-layout"
import { ModernCard } from "@/components/modern-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import {
  Copy,
  Plus,
  Settings,
  Crown,
  Shield,
  Key,
  UsersIcon,
  Activity,
  Eye,
  EyeOff,
  ArrowRight,
  User,
  Mail,
  Lock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Check,
  Code,
  Database,
  Play,
} from "lucide-react"
import Link from "next/link"

interface Application {
  id: number
  app_name: string
  public_key: string
  secret_key: string
  hwid_lock: boolean
  status: string
  created_at: string
}

interface AuthResponse {
  user: {
    id: number
    username: string
    email: string
    role: string
  }
}

interface ApplicationsResponse {
  applications: Application[]
}

interface ApiResponse {
  success: boolean
  message?: string
}

interface PasswordData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

interface ShowSecrets {
  [key: number]: boolean
}

interface LoadingStates {
  [key: number]: boolean
}

interface CopyStatus {
  [key: string]: boolean
}

const codeExamples = {
  javascript: {
    name: "JavaScript",
    icon: "🟨",
    getCode: (publicKey: string, secretKey: string) => `const response = await fetch('/api/v1/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    public_key: "${publicKey}",
    secret_key: "${secretKey}",
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
    getCode: (publicKey: string, secretKey: string) => `import requests
import json

# Authentication request
response = requests.post('/api/v1/login', json={
    "public_key": "${publicKey}",
    "secret_key": "${secretKey}",
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
    getCode: (publicKey: string, secretKey: string) => `<?php
$data = array(
    'public_key' => '${publicKey}',
    'secret_key' => '${secretKey}',
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
    getCode: (publicKey: string, secretKey: string) => `using System;
using System.Net.Http;
using System.Text;
using System.Text.Json;

var client = new HttpClient();
var data = new {
    public_key = "${publicKey}",
    secret_key = "${secretKey}",
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
    getCode: (publicKey: string, secretKey: string) => `package main

import "bytes"
import "encoding/json"
import "fmt"
import "net/http"

func main() {
    data := map[string]string{
        "public_key": "${publicKey}",
        "secret_key": "${secretKey}",
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
    getCode: (publicKey: string, secretKey: string) => `import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.URI;

public class ChessAuthExample {
    public static void main(String[] args) throws Exception {
        String json = """
        {
            "public_key": "${publicKey}",
            "secret_key": "${secretKey}",
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
    getCode: (publicKey: string, secretKey: string) => `#include <iostream>
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
        data[U("public_key")] = json::value::string(U("${publicKey}"));
        data[U("secret_key")] = json::value::string(U("${secretKey}"));
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
    getCode: (publicKey: string, secretKey: string) => `use reqwest;
use serde_json::json;
use std::collections::HashMap;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let mut data = HashMap::new();
    data.insert("public_key", "${publicKey}");
    data.insert("secret_key", "${secretKey}");
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

export default function DashboardPage() {
  const [user, setUser] = useState<{ id: number; username: string; email: string; role: string } | null>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [applicationsLoading, setApplicationsLoading] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [newAppName, setNewAppName] = useState("")
  const [showSecrets, setShowSecrets] = useState<ShowSecrets>({})
  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [settingsError, setSettingsError] = useState("")
  const [settingsSuccess, setSettingsSuccess] = useState("")
  const [createAppLoading, setCreateAppLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [hwidToggleLoading, setHwidToggleLoading] = useState<LoadingStates>({})
  const [copyStatus, setCopyStatus] = useState<CopyStatus>({})
  const [selectedLanguage, setSelectedLanguage] = useState<keyof typeof codeExamples>("javascript")
  const [selectedApp, setSelectedApp] = useState<Application | null>(null)

  const router = useRouter()

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }
    try {
      const response = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data: AuthResponse = await response.json()
        setUser(data.user)
        console.log("User data:", data.user)
      } else {
        localStorage.removeItem("token")
        router.push("/login")
      }
    } catch {
      router.push("/login")
    } finally {
      setLoading(false)
    }
  }, [router])

  const fetchApplications = useCallback(async () => {
    setApplicationsLoading(true)
    const token = localStorage.getItem("token")
    try {
      const response = await fetch("/api/applications", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data: ApplicationsResponse = await response.json()
        setApplications(data.applications)
        // Set the first app as selected by default
        if (data.applications.length > 0 && !selectedApp) {
          setSelectedApp(data.applications[0])
        }
      }
    } catch {
      console.error("Failed to fetch applications")
    } finally {
      setApplicationsLoading(false)
    }
  }, [selectedApp])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  useEffect(() => {
    if (user) {
      fetchApplications()
    }
  }, [user, fetchApplications])

  useEffect(() => {
    if (settingsSuccess || settingsError) {
      const timer = setTimeout(() => {
        setSettingsSuccess("")
        setSettingsError("")
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [settingsSuccess, settingsError])

  const createApplication = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreateAppLoading(true)
    const token = localStorage.getItem("token")
    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ app_name: newAppName }),
      })
      if (response.ok) {
        setNewAppName("")
        setShowCreateForm(false)
        fetchApplications()
      }
    } catch {
      console.error("Failed to create application")
    } finally {
      setCreateAppLoading(false)
    }
  }

  const toggleHwidLock = async (appId: number, currentState: boolean) => {
    setHwidToggleLoading((prev) => ({ ...prev, [appId]: true }))
    const token = localStorage.getItem("token")
    try {
      await fetch(`/api/applications/${appId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ hwid_lock: !currentState }),
      })
      fetchApplications()
    } catch {
      console.error("Failed to update HWID lock")
    } finally {
      setHwidToggleLoading((prev) => ({ ...prev, [appId]: false }))
    }
  }

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordLoading(true)
    setSettingsError("")
    setSettingsSuccess("")

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setSettingsError("New passwords do not match")
      setPasswordLoading(false)
      return
    }

    if (passwordData.newPassword.length < 6) {
      setSettingsError("New password must be at least 6 characters long")
      setPasswordLoading(false)
      return
    }

    const token = localStorage.getItem("token")
    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      })

      const data: ApiResponse = await response.json()
      if (data.success) {
        setSettingsSuccess("Password changed successfully!")
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        })
      } else {
        setSettingsError(data.message || "Failed to change password")
      }
    } catch {
      setSettingsError("Network error occurred")
    } finally {
      setPasswordLoading(false)
    }
  }

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopyStatus((prev) => ({ ...prev, [key]: true }))
    setTimeout(() => {
      setCopyStatus((prev) => ({ ...prev, [key]: false }))
    }, 3000)
  }

  const logout = () => {
    localStorage.removeItem("token")
    router.push("/login")
  }

  const toggleSecretVisibility = (appId: number) => {
    setShowSecrets((prev) => ({
      ...prev,
      [appId]: !prev[appId],
    }))
  }

  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = e.currentTarget
    button.innerHTML =
      '<div class="flex items-center justify-center space-x-2"><svg class="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg><span>Loading...</span></div>'
    button.disabled = true
  }

  if (loading) {
    return (
      <ModernLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-yellow-500 mx-auto" />
            <p className="text-gray-400">Loading your dashboard...</p>
          </div>
        </div>
      </ModernLayout>
    )
  }

  return (
    <ModernLayout showLogout onLogout={logout} showSettings onSettings={() => setShowSettingsModal(true)}>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="text-center space-y-4">
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-3 sm:space-y-0 sm:space-x-3">
            <Crown className="h-12 w-12 text-yellow-500 chess-float" />
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold gradient-text">Welcome back, {user?.username}!</h1>
              {/* Debug info - remove this later */}
              <p className="text-sm text-gray-500">Role: {user?.role || "undefined"}</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link href="/dashboard/users" className="h-full">
            <ModernCard className="cursor-pointer hover-glow h-full">
              <CardContent className="p-6 text-center h-full flex flex-col">
                <UsersIcon className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Manage Users</h3>
                <p className="text-gray-400 mb-4 flex-grow">Create and manage user accounts</p>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 mt-auto" onClick={handleButtonClick}>
                  Go to Users
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </ModernCard>
          </Link>

          <Link href="/dashboard/licenses" className="h-full">
            <ModernCard className="cursor-pointer hover-glow h-full">
              <CardContent className="p-6 text-center h-full flex flex-col">
                <Key className="h-12 w-12 text-green-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Generate Licenses</h3>
                <p className="text-gray-400 mb-4 flex-grow">Create and manage license keys</p>
                <Button className="w-full bg-green-600 hover:bg-green-700 mt-auto" onClick={handleButtonClick}>
                  Go to Licenses
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </ModernCard>
          </Link>

          <Link href="/dashboard/logs" className="h-full">
            <ModernCard className="cursor-pointer hover-glow h-full">
              <CardContent className="p-6 text-center h-full flex flex-col">
                <Activity className="h-12 w-12 text-orange-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">View Logs</h3>
                <p className="text-gray-400 mb-4 flex-grow">Monitor system activity and events</p>
                <Button className="w-full bg-orange-600 hover:bg-orange-700 mt-auto" onClick={handleButtonClick}>
                  Go to Logs
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </ModernCard>
          </Link>

          <Link href="/dashboard/settings" className="h-full">
            <ModernCard className="cursor-pointer hover-glow h-full">
              <CardContent className="p-6 text-center h-full flex flex-col">
                <Settings className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">App Settings</h3>
                <p className="text-gray-400 mb-4 flex-grow">Configure applications and messages</p>
                <Button className="w-full bg-purple-600 hover:bg-purple-700 mt-auto" onClick={handleButtonClick}>
                  Go to Settings
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </ModernCard>
          </Link>
        </div>

        {/* Settings Modal */}
        {showSettingsModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <ModernCard className="w-full max-w-md max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle className="gradient-text flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Account Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* User Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Profile Information</h3>
                  <div className="space-y-2">
                    <Label className="text-gray-300 flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Username
                    </Label>
                    <Input value={user?.username || ""} readOnly className="bg-black/20 border-gray-600 text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300 flex items-center">
                      <Mail className="h-4 w-4 mr-2" />
                      Email Address
                    </Label>
                    <Input value={user?.email || ""} readOnly className="bg-black/20 border-gray-600 text-white" />
                  </div>
                </div>

                {/* Password Change */}
                <div className="space-y-4 pt-4 border-t border-gray-700">
                  <h3 className="text-lg font-semibold text-white">Change Password</h3>
                  {settingsSuccess && (
                    <div className="flex items-center space-x-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                      <span className="text-green-400 text-sm">{settingsSuccess}</span>
                    </div>
                  )}
                  {settingsError && (
                    <div className="flex items-center space-x-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <AlertCircle className="h-5 w-5 text-red-400" />
                      <span className="text-red-400 text-sm">{settingsError}</span>
                    </div>
                  )}
                  <form onSubmit={changePassword} className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-gray-300">Current Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          type="password"
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                          className="pl-10 bg-black/20 border-gray-600 text-white"
                          placeholder="Enter current password"
                          required
                          disabled={passwordLoading}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-300">New Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          type="password"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          className="pl-10 bg-black/20 border-gray-600 text-white"
                          placeholder="Enter new password"
                          required
                          disabled={passwordLoading}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-300">Confirm New Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                          className="pl-10 bg-black/20 border-gray-600 text-white"
                          placeholder="Confirm new password"
                          required
                          disabled={passwordLoading}
                        />
                      </div>
                    </div>
                    <Button
                      type="submit"
                      disabled={passwordLoading}
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                    >
                      {passwordLoading ? (
                        <div className="flex items-center space-x-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Changing...</span>
                        </div>
                      ) : (
                        "Change Password"
                      )}
                    </Button>
                  </form>
                </div>

                {/* Close Button */}
                <div className="pt-4 border-t border-gray-700">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowSettingsModal(false)
                      setSettingsError("")
                      setSettingsSuccess("")
                      setPasswordData({
                        currentPassword: "",
                        newPassword: "",
                        confirmPassword: "",
                      })
                    }}
                    className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
                    disabled={passwordLoading}
                  >
                    Close
                  </Button>
                </div>
              </CardContent>
            </ModernCard>
          </div>
        )}

        {/* Applications Section */}
        <div className="space-y-6">
          {/* Header - Mobile Responsive */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold gradient-text">Your Applications</h2>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button
                onClick={() => setShowCreateForm(true)}
                className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold flex-1 sm:flex-none transition-all duration-300 ease-in-out transform hover:scale-105"
                disabled={createAppLoading}
              >
                {createAppLoading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Creating...</span>
                  </div>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    New Application
                  </>
                )}
              </Button>
              {/* Admin Panel Button - Only show for admins */}
              {user?.role === "admin" && (
                <Link href="/dashboard/admin" className="flex-1 sm:flex-none">
                  <Button
                    className="w-full min-w-[140px] bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold transition-all duration-300 ease-in-out transform hover:scale-105"
                    onClick={handleButtonClick}
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Admin Panel
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Applications Grid */}
          {applicationsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-yellow-500 mx-auto" />
                <p className="text-gray-400">Loading applications...</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {/* Create New App Modal */}
              {showCreateForm && (
                <ModernCard className="border-yellow-500/50 border-2">
                  <CardHeader>
                    <CardTitle className="text-yellow-500 flex items-center">
                      <Plus className="h-5 w-5 mr-2" />
                      Create New Application
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={createApplication} className="space-y-4">
                      <div>
                        <Label htmlFor="appName" className="text-gray-300">
                          Application Name
                        </Label>
                        <Input
                          id="appName"
                          value={newAppName}
                          onChange={(e) => setNewAppName(e.target.value)}
                          className="mt-2 bg-black/20 border-gray-600 text-white placeholder:text-gray-400 focus:border-yellow-500"
                          placeholder="Application Name"
                          required
                          disabled={createAppLoading}
                        />
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button
                          type="submit"
                          disabled={createAppLoading}
                          className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black"
                        >
                          {createAppLoading ? (
                            <div className="flex items-center space-x-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span>Creating...</span>
                            </div>
                          ) : (
                            "Create"
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowCreateForm(false)}
                          className="border-gray-600 text-gray-300 hover:bg-gray-800"
                          disabled={createAppLoading}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </ModernCard>
              )}

              {/* Application Cards */}
              {applications.map((app) => (
                <ModernCard key={app.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Crown className="h-5 w-5 text-yellow-500" />
                        <span className="gradient-text truncate">{app.app_name}</span>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Public Key */}
                    <div>
                      <Label className="text-sm text-gray-400 flex items-center">
                        <Key className="h-3 w-3 mr-1" />
                        Public Key
                      </Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Input
                          value={app.public_key}
                          readOnly
                          className="bg-black/20 border-gray-600 text-white text-xs font-mono"
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(app.public_key, `public-${app.id}`)}
                          className="text-gray-400 hover:text-white flex-shrink-0"
                        >
                          {copyStatus[`public-${app.id}`] ? (
                            <Check className="h-4 w-4 text-green-400" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Secret Key */}
                    <div>
                      <Label className="text-sm text-gray-400 flex items-center">
                        <Shield className="h-3 w-3 mr-1" />
                        Secret Key
                      </Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Input
                          value={showSecrets[app.id] ? app.secret_key : "••••••••••••••••••••••••••••••••••••••••"}
                          readOnly
                          className="bg-black/20 border-gray-600 text-white text-xs font-mono"
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleSecretVisibility(app.id)}
                          className="text-gray-400 hover:text-white flex-shrink-0"
                        >
                          {showSecrets[app.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(app.secret_key, `secret-${app.id}`)}
                          className="text-gray-400 hover:text-white flex-shrink-0"
                        >
                          {copyStatus[`secret-${app.id}`] ? (
                            <Check className="h-4 w-4 text-green-400" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* HWID Lock Toggle */}
                    <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Shield className="h-4 w-4 text-blue-400" />
                        <Label className="text-sm text-gray-300">HWID Lock</Label>
                        {hwidToggleLoading[app.id] && <Loader2 className="h-3 w-3 animate-spin text-blue-400" />}
                      </div>
                      <Switch
                        checked={app.hwid_lock}
                        onCheckedChange={() => toggleHwidLock(app.id, app.hwid_lock)}
                        disabled={hwidToggleLoading[app.id]}
                      />
                    </div>

                    {/* App Info */}
                    <div className="text-xs text-gray-500 pt-2 border-t border-gray-700">
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                        <span>Created: {new Date(app.created_at).toLocaleDateString()}</span>
                        <span
                          className={`px-2 py-1 rounded text-xs self-start ${
                            app.status === "active" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {app.status}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </ModernCard>
              ))}
            </div>
          )}

          {applications.length === 0 && !showCreateForm && !applicationsLoading && (
            <div className="text-center py-12">
              <Crown className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">No Applications Yet</h3>
              <p className="text-gray-500 mb-6">Create your first application to get started with ChessAuth</p>
              <Button
                onClick={() => setShowCreateForm(true)}
                className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold"
                disabled={createAppLoading}
              >
                {createAppLoading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Creating...</span>
                  </div>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First App
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        {/* API Integration Section */}
        {applications.length > 0 && (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold gradient-text flex items-center justify-center">
                <Code className="h-6 w-6 mr-2" />
                API Integration
              </h2>
              <p className="text-gray-400">Use your application keys to integrate ChessAuth into your projects</p>
            </div>

            {/* App Selector */}
            <div className="flex justify-center">
              <div className="flex flex-wrap gap-2 p-3 bg-black/30 rounded-xl border border-yellow-500/20 backdrop-blur-sm max-w-4xl">
                {applications.map((app) => (
                  <Button
                    key={app.id}
                    variant={selectedApp?.id === app.id ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setSelectedApp(app)}
                    className={`${
                      selectedApp?.id === app.id
                        ? "bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-semibold"
                        : "text-gray-300 hover:text-white hover:bg-gray-800"
                    } transition-all duration-200 flex items-center gap-2`}
                  >
                    <Crown className="h-4 w-4" />
                    <span className="hidden sm:inline">{app.app_name}</span>
                    <span className="sm:hidden">{app.app_name.slice(0, 8)}...</span>
                  </Button>
                ))}
              </div>
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

            {selectedApp && (
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
                            copyToClipboard(
                              codeExamples[selectedLanguage].getCode(selectedApp.public_key, selectedApp.secret_key),
                              `api-request-${selectedLanguage}-${selectedApp.id}`,
                            )
                          }
                          className={`transition-all duration-200 ${
                            copyStatus[`api-request-${selectedLanguage}-${selectedApp.id}`]
                              ? "text-green-400 hover:text-green-300"
                              : "text-gray-400 hover:text-white"
                          }`}
                        >
                          {copyStatus[`api-request-${selectedLanguage}-${selectedApp.id}`] ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      {/* Code Content */}
                      <div className="relative">
                        <div className="bg-gray-900/20 p-6 text-sm overflow-x-auto min-h-[400px]">
                          <SyntaxHighlighter
                            code={codeExamples[selectedLanguage].getCode(
                              selectedApp.public_key,
                              selectedApp.secret_key,
                            )}
                            language={selectedLanguage}
                          />
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
                            copyToClipboard(
                              codeExamples[selectedLanguage].response,
                              `api-response-${selectedLanguage}-${selectedApp.id}`,
                            )
                          }
                          className={`transition-all duration-200 ${
                            copyStatus[`api-response-${selectedLanguage}-${selectedApp.id}`]
                              ? "text-green-400 hover:text-green-300"
                              : "text-gray-400 hover:text-white"
                          }`}
                        >
                          {copyStatus[`api-response-${selectedLanguage}-${selectedApp.id}`] ? (
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

                  {/* Integration Note */}
                  <div className="p-6 bg-gradient-to-r from-yellow-500/10 to-blue-500/10 border-t border-yellow-500/20">
                    <div className="flex items-start space-x-3">
                      <Crown className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="text-yellow-500 font-semibold mb-1">Integration Ready</h4>
                        <p className="text-gray-300 text-sm">
                          Your API keys for <span className="font-semibold text-white">{selectedApp.app_name}</span> are
                          already included in the code above. The HWID can be generated using our client libraries or
                          your own hardware fingerprinting solution.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </ModernCard>
            )}
          </div>
        )}
      </div>
    </ModernLayout>
  )
}