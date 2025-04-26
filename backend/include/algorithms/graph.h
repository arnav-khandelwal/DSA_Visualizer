#ifndef GRAPH_H
#define GRAPH_H

#include <vector>
#include <string>
#include <sstream>
#include <queue>
#include <stack>
#include <algorithm>
#include <limits>
#include <set>
#include <utility>

// Prevent max macro interference (Windows specific)
#ifdef max
#undef max
#endif

// Graph representation for visualization
std::string graphStateToJson(const std::vector<std::vector<std::pair<int, int>>>& graph, 
                            const std::vector<int>& visited, 
                            int current,
                            const std::string& status) {
    std::ostringstream json;
    json << "{\"nodes\":[";
    
    for (size_t i = 0; i < graph.size(); ++i) {
        if (i > 0) json << ",";
        
        // Determine node state (current, visited, unvisited)
        std::string state = "unvisited";
        if (static_cast<int>(i) == current) state = "current";
        else if (std::find(visited.begin(), visited.end(), i) != visited.end()) state = "visited";
        
        json << "{\"id\":" << i << ",\"state\":\"" << state << "\"}";
    }
    
    json << "],\"edges\":[";
    
    // Add edges
    bool firstEdge = true;
    for (size_t u = 0; u < graph.size(); ++u) {
        for (const auto& edge : graph[u]) {
            int v = edge.first;
            int weight = edge.second;
            
            if (!firstEdge) json << ",";
            firstEdge = false;
            
            json << "{\"source\":" << u << ",\"target\":" << v << ",\"weight\":" << weight << "}";
        }
    }
    
    json << "],\"status\":\"" << status << "\"}";
    return json.str();
}

// BFS algorithm with visualization steps
std::vector<std::string> breadthFirstSearch(const std::vector<std::vector<std::pair<int, int>>>& graph, int start) {
    std::vector<std::string> steps;
    std::vector<int> visited;
    std::queue<int> q;
    
    // Add initial state
    steps.push_back(graphStateToJson(graph, visited, start, "Starting BFS from node " + std::to_string(start)));
    
    q.push(start);
    visited.push_back(start);
    
    while (!q.empty()) {
        int current = q.front();
        q.pop();
        
        // Add current node processing state
        steps.push_back(graphStateToJson(graph, visited, current, "Processing node " + std::to_string(current)));
        
        // Process all neighbors
        for (const auto& edge : graph[current]) {
            int neighbor = edge.first;
            
            // If not visited
            if (std::find(visited.begin(), visited.end(), neighbor) == visited.end()) {
                // Add edge traversal state
                steps.push_back(graphStateToJson(graph, visited, current, 
                    "Discovering edge " + std::to_string(current) + " -> " + std::to_string(neighbor)));
                
                visited.push_back(neighbor);
                q.push(neighbor);
                
                // Add node discovery state
                steps.push_back(graphStateToJson(graph, visited, neighbor, 
                    "Discovered node " + std::to_string(neighbor)));
            }
        }
    }
    
    // Add final state
    steps.push_back(graphStateToJson(graph, visited, -1, "BFS complete"));
    
    return steps;
}

// DFS algorithm with visualization steps
std::vector<std::string> depthFirstSearch(const std::vector<std::vector<std::pair<int, int>>>& graph, int start) {
    std::vector<std::string> steps;
    std::vector<int> visited;
    std::stack<int> s;
    
    // Add initial state
    steps.push_back(graphStateToJson(graph, visited, start, "Starting DFS from node " + std::to_string(start)));
    
    s.push(start);
    
    while (!s.empty()) {
        int current = s.top();
        s.pop();
        
        // If already visited, continue
        if (std::find(visited.begin(), visited.end(), current) != visited.end()) {
            continue;
        }
        
        // Mark as visited
        visited.push_back(current);
        
        // Add current node processing state
        steps.push_back(graphStateToJson(graph, visited, current, "Processing node " + std::to_string(current)));
        
        // Process all neighbors in reverse order (so they come out of stack in original order)
        for (auto it = graph[current].rbegin(); it != graph[current].rend(); ++it) {
            int neighbor = it->first;
            
            // If not visited
            if (std::find(visited.begin(), visited.end(), neighbor) == visited.end()) {
                // Add edge consideration state
                steps.push_back(graphStateToJson(graph, visited, current, 
                    "Considering edge " + std::to_string(current) + " -> " + std::to_string(neighbor)));
                
                s.push(neighbor);
            }
        }
    }
    
    // Add final state
    steps.push_back(graphStateToJson(graph, visited, -1, "DFS complete"));
    
    return steps;
}

// Dijkstra's algorithm with visualization steps
std::vector<std::string> dijkstraAlgorithm(const std::vector<std::vector<std::pair<int, int>>>& graph, int start) {
    std::vector<std::string> steps;
    std::vector<int> visited;
    std::vector<int> distances(graph.size(), std::numeric_limits<int>::max());
    std::vector<int> previous(graph.size(), -1);
    
    // Priority queue for (distance, node) pairs
    std::priority_queue<std::pair<int, int>, std::vector<std::pair<int, int>>, std::greater<>> pq;
    
    // Add initial state
    steps.push_back(graphStateToJson(graph, visited, start, "Starting Dijkstra's algorithm from node " + std::to_string(start)));
    
    // Initialize distances
    distances[start] = 0;
    pq.push({0, start});
    
    while (!pq.empty()) {
        int dist = pq.top().first;
        int current = pq.top().second;
        pq.pop();
        
        // Skip if already processed
        if (std::find(visited.begin(), visited.end(), current) != visited.end()) {
            continue;
        }
        
        // Mark as visited
        visited.push_back(current);
        
        // Add current node processing state
        steps.push_back(graphStateToJson(graph, visited, current, 
            "Processing node " + std::to_string(current) + " with distance " + std::to_string(dist)));
        
        // Process all neighbors
        for (const auto& edge : graph[current]) {
            int neighbor = edge.first;
            int weight = edge.second;
            
            // If already visited, skip
            if (std::find(visited.begin(), visited.end(), neighbor) != visited.end()) {
                continue;
            }
            
            // Add edge consideration state
            steps.push_back(graphStateToJson(graph, visited, current, 
                "Considering edge " + std::to_string(current) + " -> " + std::to_string(neighbor) + 
                " with weight " + std::to_string(weight)));
            
            // Relaxation step
            int newDist = dist + weight;
            if (newDist < distances[neighbor]) {
                distances[neighbor] = newDist;
                previous[neighbor] = current;
                pq.push({newDist, neighbor});
                
                // Add distance update state
                steps.push_back(graphStateToJson(graph, visited, neighbor, 
                    "Updated distance to node " + std::to_string(neighbor) + " = " + std::to_string(newDist)));
            }
        }
    }
    
    // Add final state with shortest paths
    std::ostringstream paths;
    paths << "Dijkstra complete. Shortest paths from " << start << ": ";
    for (size_t i = 0; i < distances.size(); ++i) {
        if (i != static_cast<size_t>(start)) {
            if (distances[i] == std::numeric_limits<int>::max()) {
                paths << i << "(∞) ";
            } else {
                paths << i << "(" << distances[i] << ") ";
            }
        }
    }
    
    steps.push_back(graphStateToJson(graph, visited, -1, paths.str()));
    
    return steps;
}

// Helper class for Kruskal's MST
class DisjointSet {
private:
    std::vector<int> parent, rank;
    
public:
    DisjointSet(int n) {
        parent.resize(n);
        rank.resize(n, 0);
        for (int i = 0; i < n; ++i) {
            parent[i] = i;
        }
    }
    
    int find(int u) {
        if (u != parent[u]) {
            parent[u] = find(parent[u]);
        }
        return parent[u];
    }
    
    void unionSets(int u, int v) {
        int ru = find(u);
        int rv = find(v);
        
        if (ru != rv) {
            if (rank[ru] < rank[rv]) {
                parent[ru] = rv;
            } else if (rank[ru] > rank[rv]) {
                parent[rv] = ru;
            } else {
                parent[rv] = ru;
                rank[ru]++;
            }
        }
    }
};

// Kruskal's MST algorithm with visualization steps
std::vector<std::string> kruskalMST(const std::vector<std::vector<std::pair<int, int>>>& graph) {
    std::vector<std::string> steps;
    std::vector<int> visited;
    
    // Add initial state
    steps.push_back(graphStateToJson(graph, visited, -1, "Starting Kruskal's MST algorithm"));
    
    // Create edge list from adjacency list
    std::vector<std::tuple<int, int, int>> edges; // (weight, u, v)
    for (size_t u = 0; u < graph.size(); ++u) {
        for (const auto& edge : graph[u]) {
            int v = edge.first;
            int weight = edge.second;
            
            // Only add edge once (u,v) where u < v to avoid duplicates
            if (static_cast<int>(u) < v) {
                edges.push_back(std::make_tuple(weight, u, v));
            }
        }
    }
    
    // Sort edges by weight
    std::sort(edges.begin(), edges.end());
    
    // Initialize MST
    std::vector<std::pair<int, int>> mst; // (u, v) edges in MST
    DisjointSet ds(static_cast<int>(graph.size()));
    
    // Process edges
    for (const auto& edge : edges) {
        int weight = std::get<0>(edge);
        int u = std::get<1>(edge);
        int v = std::get<2>(edge);
        
        // Consider edge
        steps.push_back(graphStateToJson(graph, visited, -1, 
            "Considering edge " + std::to_string(u) + " -> " + std::to_string(v) + 
            " with weight " + std::to_string(weight)));
        
        // Check if adding edge creates a cycle
        if (ds.find(u) != ds.find(v)) {
            // Add edge to MST
            mst.push_back({u, v});
            ds.unionSets(u, v);
            
            // Update visualization state
            visited.push_back(u);
            if (std::find(visited.begin(), visited.end(), v) == visited.end()) {
                visited.push_back(v);
            }
            
            // Add edge addition state
            steps.push_back(graphStateToJson(graph, visited, -1, 
                "Added edge " + std::to_string(u) + " -> " + std::to_string(v) + 
                " to MST (weight: " + std::to_string(weight) + ")"));
        } else {
            // Add cycle detection state
            steps.push_back(graphStateToJson(graph, visited, -1, 
                "Edge " + std::to_string(u) + " -> " + std::to_string(v) + 
                " would create a cycle - skipping"));
        }
    }
    
    // Add final state
    int totalWeight = 0;
    for (const auto& edge : mst) {
        for (const auto& adj : graph[edge.first]) {
            if (adj.first == edge.second) {
                totalWeight += adj.second;
                break;
            }
        }
    }
    
    steps.push_back(graphStateToJson(graph, visited, -1, 
        "Kruskal's MST algorithm complete. Total MST weight: " + std::to_string(totalWeight)));
    
    return steps;
}

// Prim's MST algorithm with visualization steps
std::vector<std::string> primMST(const std::vector<std::vector<std::pair<int, int>>>& graph) {
    if (graph.empty()) return {};
    
    std::vector<std::string> steps;
    std::vector<int> visited;
    
    // Start from node 0
    int start = 0;
    
    // Add initial state
    steps.push_back(graphStateToJson(graph, visited, start, 
        "Starting Prim's MST algorithm from node " + std::to_string(start)));
    
    // Priority queue for (weight, to, from) triples
    std::priority_queue<std::tuple<int, int, int>, 
                        std::vector<std::tuple<int, int, int>>, 
                        std::greater<>> pq;
    
    // Initialize
    visited.push_back(start);
    for (const auto& edge : graph[start]) {
        pq.push(std::make_tuple(edge.second, edge.first, start));
    }
    
    // Add edge consideration state
    steps.push_back(graphStateToJson(graph, visited, start, 
        "Added all edges from node " + std::to_string(start) + " to priority queue"));
    
    // Process edges
    int totalWeight = 0;
    while (!pq.empty() && visited.size() < graph.size()) {
        // Get minimum weight edge
        int weight = std::get<0>(pq.top());
        int to = std::get<1>(pq.top());
        int from = std::get<2>(pq.top());
        pq.pop();
        
        // If destination already visited, skip
        if (std::find(visited.begin(), visited.end(), to) != visited.end()) {
            steps.push_back(graphStateToJson(graph, visited, -1, 
                "Edge " + std::to_string(from) + " -> " + std::to_string(to) + 
                " connects to already visited node - skipping"));
            continue;
        }
        
        // Add edge to MST
        totalWeight += weight;
        visited.push_back(to);
        
        // Add edge addition state
        steps.push_back(graphStateToJson(graph, visited, to, 
            "Added edge " + std::to_string(from) + " -> " + std::to_string(to) + 
            " to MST (weight: " + std::to_string(weight) + ")"));
        
        // Add adjacent edges of the new node
        for (const auto& edge : graph[to]) {
            int nextNode = edge.first;
            int nextWeight = edge.second;
            
            // If not visited, add to priority queue
            if (std::find(visited.begin(), visited.end(), nextNode) == visited.end()) {
                pq.push(std::make_tuple(nextWeight, nextNode, to));
            }
        }
        
        // Add edge consideration state
        steps.push_back(graphStateToJson(graph, visited, to, 
            "Added all edges from node " + std::to_string(to) + " to priority queue"));
    }
    
    // Add final state
    steps.push_back(graphStateToJson(graph, visited, -1, 
        "Prim's MST algorithm complete. Total MST weight: " + std::to_string(totalWeight)));
    
    return steps;
}

#endif // GRAPH_H