#include "server.h"
#include <iostream>
#include <sstream>
#include <fstream>
#include <thread>
#include <vector>
#include <algorithm>
#include <iomanip>

// Algorithm headers
#include "algorithms/sorting.h"
#include "algorithms/searching.h"
#include "algorithms/graph.h"
#include "data_structures/tree.h"
#include "data_structures/heap.h"

// CORS headers for all responses
const std::string CORS_HEADERS = "Access-Control-Allow-Origin: *\r\n"
                                "Access-Control-Allow-Methods: GET, POST, OPTIONS\r\n"
                                "Access-Control-Allow-Headers: Content-Type\r\n";

AlgoServer::AlgoServer(int port) : port(port), running(false) {
#ifdef _WIN32
    // Initialize Winsock
    WSADATA wsaData;
    int result = WSAStartup(MAKEWORD(2, 2), &wsaData);
    if (result != 0) {
        std::cerr << "WSAStartup failed: " << result << std::endl;
        return;
    }
#endif

    // Create socket
    if ((server_fd = socket(AF_INET, SOCK_STREAM, 0)) == 0) {
        std::cerr << "Socket creation failed" << std::endl;
        return;
    }

    // Set socket options
    int opt = 1;
#ifdef _WIN32
    if (setsockopt(server_fd, SOL_SOCKET, SO_REUSEADDR, (const char*)&opt, sizeof(opt)) < 0) {
#else
    if (setsockopt(server_fd, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt)) < 0) {
#endif
        std::cerr << "Setsockopt failed" << std::endl;
        return;
    }

    address.sin_family = AF_INET;
    address.sin_addr.s_addr = INADDR_ANY;
    address.sin_port = htons(port);

    // Bind socket
    if (bind(server_fd, (struct sockaddr*)&address, sizeof(address)) < 0) {
        std::cerr << "Bind failed" << std::endl;
        return;
    }

    // Listen
    if (listen(server_fd, 10) < 0) {
        std::cerr << "Listen failed" << std::endl;
        return;
    }

    // Initialize routes
    initRoutes();
}

AlgoServer::~AlgoServer() {
#ifdef _WIN32
    closesocket(server_fd);
    WSACleanup();
#else
    close(server_fd);
#endif
}

void AlgoServer::start() {
    running = true;
    std::cout << "Server started on port " << port << std::endl;

    while (running) {
        int addrlen = sizeof(address);
#ifdef _WIN32
        int new_socket = accept(server_fd, (struct sockaddr*)&address, &addrlen);
#else
        int new_socket = accept(server_fd, (struct sockaddr*)&address, (socklen_t*)&addrlen);
#endif
        if (new_socket < 0) {
            std::cerr << "Accept failed" << std::endl;
            continue;
        }

        // Read HTTP request
        char buffer[30000] = {0};
#ifdef _WIN32
        int valread = recv(new_socket, buffer, 30000, 0);
#else
        int valread = read(new_socket, buffer, 30000);
#endif
        if (valread <= 0) {
            std::cerr << "Read failed" << std::endl;
#ifdef _WIN32
            closesocket(new_socket);
#else
            close(new_socket);
#endif
            continue;
        }

        // Parse HTTP request
        std::string request(buffer);
        size_t method_end = request.find(' ');
        if (method_end == std::string::npos) {
#ifdef _WIN32
            closesocket(new_socket);
#else
            close(new_socket);
#endif
            continue;
        }

        std::string method = request.substr(0, method_end);
        size_t path_end = request.find(' ', method_end + 1);
        if (path_end == std::string::npos) {
#ifdef _WIN32
            closesocket(new_socket);
#else
            close(new_socket);
#endif
            continue;
        }

        std::string path = request.substr(method_end + 1, path_end - method_end - 1);
        
        // Extract request body
        std::string body;
        size_t body_start = request.find("\r\n\r\n");
        if (body_start != std::string::npos) {
            body = request.substr(body_start + 4);
        }

        // Handle OPTIONS preflight request for CORS
        if (method == "OPTIONS") {
            std::string response = "HTTP/1.1 200 OK\r\n" + CORS_HEADERS + "Content-Length: 0\r\n\r\n";
#ifdef _WIN32
            send(new_socket, response.c_str(), response.length(), 0);
            closesocket(new_socket);
#else
            write(new_socket, response.c_str(), response.length());
            close(new_socket);
#endif
            continue;
        }

        // Find appropriate handler
        std::string response;
        bool handled = false;

        for (const auto& handler : routeHandlers) {
            if (path.find(handler.first) == 0) {
                response = handler.second(method, path, body);
                handled = true;
                break;
            }
        }

        if (!handled) {
            // Default 404 response
            response = "HTTP/1.1 404 Not Found\r\n" + CORS_HEADERS + 
                      "Content-Type: application/json\r\n"
                      "Content-Length: 27\r\n"
                      "\r\n"
                      "{\"error\":\"Route not found\"}";
        }

        // Send response
#ifdef _WIN32
        send(new_socket, response.c_str(), response.length(), 0);
        closesocket(new_socket);
#else
        write(new_socket, response.c_str(), response.length());
        close(new_socket);
#endif
    }
}

void AlgoServer::stop() {
    running = false;
}

std::string AlgoServer::jsonResponse(const std::string& data, int statusCode) {
    std::string statusText = (statusCode == 200) ? "OK" : "Bad Request";
    
    return "HTTP/1.1 " + std::to_string(statusCode) + " " + statusText + "\r\n" +
           CORS_HEADERS +
           "Content-Type: application/json\r\n"
           "Content-Length: " + std::to_string(data.length()) + "\r\n"
           "\r\n" + data;
}

std::string AlgoServer::errorResponse(const std::string& message, int statusCode) {
    std::string error = "{\"error\":\"" + escapeJson(message) + "\"}";
    return jsonResponse(error, statusCode);
}

std::map<std::string, std::string> AlgoServer::parseJson(const std::string& jsonStr) {
    std::map<std::string, std::string> result;
    
    size_t pos = 0;
    while(pos < jsonStr.size()) {
        // Find key start (after quote)
        size_t keyStart = jsonStr.find('"', pos);
        if (keyStart == std::string::npos) break;
        keyStart++;
        
        // Find key end (before quote)
        size_t keyEnd = jsonStr.find('"', keyStart);
        if (keyEnd == std::string::npos) break;
        
        std::string key = jsonStr.substr(keyStart, keyEnd - keyStart);
        
        // Find value start (after colon and whitespace)
        size_t valueStart = jsonStr.find(':', keyEnd) + 1;
        while (valueStart < jsonStr.size() && std::isspace(jsonStr[valueStart])) {
            valueStart++;
        }
        
        if (valueStart >= jsonStr.size()) break;
        
        std::string value;
        if (jsonStr[valueStart] == '"') {
            // String value
            valueStart++;
            size_t valueEnd = jsonStr.find('"', valueStart);
            if (valueEnd == std::string::npos) break;
            value = jsonStr.substr(valueStart, valueEnd - valueStart);
            pos = valueEnd + 1;
        } else if (jsonStr[valueStart] == '[') {
            // Array value - find the matching closing bracket
            int bracketCount = 1;
            size_t valueEnd = valueStart + 1;
            
            while (valueEnd < jsonStr.size() && bracketCount > 0) {
                if (jsonStr[valueEnd] == '[') bracketCount++;
                else if (jsonStr[valueEnd] == ']') bracketCount--;
                valueEnd++;
            }
            
            value = jsonStr.substr(valueStart, valueEnd - valueStart);
            pos = valueEnd;
        } else if (jsonStr[valueStart] == '{') {
            // Object value - find the matching closing brace
            int braceCount = 1;
            size_t valueEnd = valueStart + 1;
            
            while (valueEnd < jsonStr.size() && braceCount > 0) {
                if (jsonStr[valueEnd] == '{') braceCount++;
                else if (jsonStr[valueEnd] == '}') braceCount--;
                valueEnd++;
            }
            
            value = jsonStr.substr(valueStart, valueEnd - valueStart);
            pos = valueEnd;
        } else {
            // Number or other value - find next comma or closing brace
            size_t valueEnd = jsonStr.find_first_of(",}", valueStart);
            if (valueEnd == std::string::npos) break;
            value = jsonStr.substr(valueStart, valueEnd - valueStart);
            // Trim whitespace
            while (!value.empty() && std::isspace(value.back())) {
                value.pop_back();
            }
            pos = valueEnd;
        }
        
        result[key] = value;
    }
    
    return result;
}

std::string AlgoServer::escapeJson(const std::string& s) {
    std::ostringstream o;
    for (auto c = s.cbegin(); c != s.cend(); c++) {
        if (*c == '"' || *c == '\\' || ('\x00' <= *c && *c <= '\x1f')) {
            o << "\\u" << std::hex << std::setw(4) << std::setfill('0') << static_cast<int>(*c);
        } else {
            o << *c;
        }
    }
    return o.str();
}

void AlgoServer::registerHandler(const std::string& route, HandlerFunction handler) {
    routeHandlers[route] = handler;
}

void AlgoServer::initRoutes() {
    // Sorting algorithms
    registerHandler("/api/sort", [this](const std::string& method, const std::string& path, const std::string& body) -> std::string {
        if (method != "POST") {
            return errorResponse("Method not allowed", 405);
        }
        
        try {
            auto params = parseJson(body);
            std::string algorithm = params["algorithm"];
            std::string arrayStr = params["array"];
            
            // Parse array
            std::vector<int> array;
            size_t pos = 0;
            while ((pos = arrayStr.find_first_of("0123456789", pos)) != std::string::npos) {
                size_t endPos = arrayStr.find_first_not_of("0123456789", pos);
                if (endPos == std::string::npos) endPos = arrayStr.length();
                array.push_back(std::stoi(arrayStr.substr(pos, endPos - pos)));
                pos = endPos;
            }
            
            // Perform sorting and track steps
            std::vector<std::string> steps;
            if (algorithm == "bubble") {
                steps = bubbleSort(array);
            } else if (algorithm == "insertion") {
                steps = insertionSort(array);
            } else if (algorithm == "selection") {
                steps = selectionSort(array);
            } else if (algorithm == "merge") {
                steps = mergeSort(array);
            } else if (algorithm == "quick") {
                steps = quickSort(array);
            } else if (algorithm == "heap") {
                steps = heapSort(array);
            } else {
                return errorResponse("Unknown sorting algorithm: " + algorithm, 400);
            }
            
            // Convert steps to JSON array
            std::ostringstream stepsJson;
            stepsJson << "[";
            for (size_t i = 0; i < steps.size(); ++i) {
                if (i > 0) stepsJson << ",";
                stepsJson << steps[i];
            }
            stepsJson << "]";
            
            std::string response = "{\"steps\":" + stepsJson.str() + "}";
            return jsonResponse(response, 200);
        } catch (const std::exception& e) {
            return errorResponse(std::string("Error: ") + e.what(), 400);
        }
    });
    
    // Searching algorithms
    registerHandler("/api/search", [this](const std::string& method, const std::string& path, const std::string& body) -> std::string {
        if (method != "POST") {
            return errorResponse("Method not allowed", 405);
        }
        
        try {
            auto params = parseJson(body);
            std::string algorithm = params["algorithm"];
            std::string arrayStr = params["array"];
            int target = std::stoi(params["target"]);
            
            // Parse array
            std::vector<int> array;
            size_t pos = 0;
            while ((pos = arrayStr.find_first_of("0123456789", pos)) != std::string::npos) {
                size_t endPos = arrayStr.find_first_not_of("0123456789", pos);
                if (endPos == std::string::npos) endPos = arrayStr.length();
                array.push_back(std::stoi(arrayStr.substr(pos, endPos - pos)));
                pos = endPos;
            }
            
            // Perform search and track steps
            std::vector<std::string> steps;
            int result = -1;
            
            if (algorithm == "linear") {
                result = linearSearch(array, target, steps);
            } else if (algorithm == "binary") {
                // Binary search requires sorted array
                std::sort(array.begin(), array.end());
                result = binarySearch(array, target, steps);
            } else {
                return errorResponse("Unknown searching algorithm: " + algorithm, 400);
            }
            
            // Convert steps to JSON array
            std::ostringstream stepsJson;
            stepsJson << "[";
            for (size_t i = 0; i < steps.size(); ++i) {
                if (i > 0) stepsJson << ",";
                stepsJson << steps[i];
            }
            stepsJson << "]";
            
            std::string response = "{\"steps\":" + stepsJson.str() + 
                                  ",\"result\":" + std::to_string(result) + "}";
            return jsonResponse(response, 200);
        } catch (const std::exception& e) {
            return errorResponse(std::string("Error: ") + e.what(), 400);
        }
    });
    
    // Graph algorithms
    registerHandler("/api/graph", [this](const std::string& method, const std::string& path, const std::string& body) -> std::string {
        if (method != "POST") {
            return errorResponse("Method not allowed", 405);
        }
        
        try {
            auto params = parseJson(body);
            std::string algorithm = params["algorithm"];
            std::string graphData = params["graph"];
            
            // Additional parameters based on algorithm
            int startNode = 0;
            int endNode = 0;
            
            if (params.find("startNode") != params.end()) {
                startNode = std::stoi(params["startNode"]);
            }
            
            if (params.find("endNode") != params.end()) {
                endNode = std::stoi(params["endNode"]);
            }
            
            // Parse graph from adjacency list format
            std::vector<std::vector<std::pair<int, int>>> graph;
            // ... parsing logic for graph
            
            // Run algorithm and get visualization steps
            std::vector<std::string> steps;
            if (algorithm == "bfs") {
                steps = breadthFirstSearch(graph, startNode);
            } else if (algorithm == "dfs") {
                steps = depthFirstSearch(graph, startNode);
            } else if (algorithm == "dijkstra") {
                steps = dijkstraAlgorithm(graph, startNode);
            } else if (algorithm == "kruskal") {
                steps = kruskalMST(graph);
            } else if (algorithm == "prim") {
                steps = primMST(graph);
            } else {
                return errorResponse("Unknown graph algorithm: " + algorithm, 400);
            }
            
            // Convert steps to JSON array
            std::ostringstream stepsJson;
            stepsJson << "[";
            for (size_t i = 0; i < steps.size(); ++i) {
                if (i > 0) stepsJson << ",";
                stepsJson << steps[i];
            }
            stepsJson << "]";
            
            std::string response = "{\"steps\":" + stepsJson.str() + "}";
            return jsonResponse(response, 200);
        } catch (const std::exception& e) {
            return errorResponse(std::string("Error: ") + e.what(), 400);
        }
    });
    
    // Data structure operations (Tree, Heap, etc.)
    registerHandler("/api/data-structure", [this](const std::string& method, const std::string& path, const std::string& body) -> std::string {
        if (method != "POST") {
            return errorResponse("Method not allowed", 405);
        }
        
        try {
            auto params = parseJson(body);
            std::string structure = params["structure"];
            std::string operation = params["operation"];
            
            // Handle different data structures
            if (structure == "bst") {
                // Binary Search Tree operations
                if (operation == "insert") {
                    int value = std::stoi(params["value"]);
                    std::vector<std::string> steps = bstInsert(value);
                    
                    // Convert steps to JSON
                    std::ostringstream stepsJson;
                    stepsJson << "[";
                    for (size_t i = 0; i < steps.size(); ++i) {
                        if (i > 0) stepsJson << ",";
                        stepsJson << steps[i];
                    }
                    stepsJson << "]";
                    
                    std::string response = "{\"steps\":" + stepsJson.str() + "}";
                    return jsonResponse(response, 200);
                } else if (operation == "delete") {
                    // Similar implementation for delete
                } else if (operation == "search") {
                    // Similar implementation for search
                }
            } else if (structure == "heap") {
                // Heap operations
            } else if (structure == "trie") {
                // Trie operations
            } else if (structure == "avl") {
                // AVL Tree operations
            }
            
            return errorResponse("Unknown operation or data structure", 400);
        } catch (const std::exception& e) {
            return errorResponse(std::string("Error: ") + e.what(), 400);
        }
    });
    
    // Get available algorithms
    registerHandler("/api/algorithms", [this](const std::string& method, const std::string& path, const std::string& body) -> std::string {
        if (method != "GET") {
            return errorResponse("Method not allowed", 405);
        }
        
        std::string algorithms = R"({
            "sorting": ["bubble", "insertion", "selection", "merge", "quick", "heap"],
            "searching": ["linear", "binary"],
            "graph": ["bfs", "dfs", "dijkstra", "kruskal", "prim"],
            "dataStructures": ["bst", "heap", "trie", "avl"]
        })";
        
        return jsonResponse(algorithms, 200);
    });
}