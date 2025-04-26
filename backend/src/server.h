#ifndef SERVER_H
#define SERVER_H

#include <string>
#include <functional>
#include <map>

#ifdef _WIN32
#include <winsock2.h>
#include <ws2tcpip.h>
#pragma comment(lib, "ws2_32.lib")
#else
#include <unistd.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#endif

class AlgoServer {
private:
    int server_fd;
    struct sockaddr_in address;
    int port;
    bool running;

    // Response handler type
    typedef std::function<std::string(const std::string&, const std::string&, const std::string&)> HandlerFunction;
    
    // Algorithm handlers
    std::map<std::string, HandlerFunction> routeHandlers;
    
    // Initialize API routes
    void initRoutes();
    
    // Utility methods
    std::string jsonResponse(const std::string& data, int statusCode = 200);
    std::string errorResponse(const std::string& message, int statusCode = 400);
    std::map<std::string, std::string> parseJson(const std::string& jsonStr);
    std::string escapeJson(const std::string& s);

public:
    AlgoServer(int port = 8080);
    ~AlgoServer();
    
    void start();
    void stop();
    
    // Register a handler for a specific route
    void registerHandler(const std::string& route, HandlerFunction handler);
};

#endif // SERVER_H