#include <iostream>
#include "server.h"

int main() {
    std::cout << "Starting Algorithm Visualizer Backend..." << std::endl;
    
    AlgoServer server(8080);
    server.start();
    
    return 0;
}