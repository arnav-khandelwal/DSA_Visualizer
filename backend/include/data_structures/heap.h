#ifndef HEAP_H
#define HEAP_H

#include <vector>
#include <string>
#include <sstream>
#include <algorithm>

// Global heap for visualization
static std::vector<int> heapArray;

// Convert heap to JSON for visualization
std::string heapToJson(const std::vector<int>& heap, int highlightIndex = -1, int highlightIndex2 = -1) {
    std::ostringstream json;
    json << "{\"heap\":[";
    
    for (size_t i = 0; i < heap.size(); ++i) {
        if (i > 0) json << ",";
        
        json << "{\"value\":" << heap[i];
        
        if (i == highlightIndex || i == highlightIndex2) {
            json << ",\"highlight\":true";
        } else {
            json << ",\"highlight\":false";
        }
        
        json << "}";
    }
    
    json << "]}";
    return json.str();
}

// Helper function to get status text with indices
std::string getHeapStatusWithIndices(const std::string& action, int i, int j) {
    std::ostringstream status;
    status << action << " (indices " << i << " and " << j << ")";
    return status.str();
}

// Heapify function for visualization
void heapifyWithVisualization(std::vector<int>& heap, int n, int i, std::vector<std::string>& steps) {
    int largest = i;
    int left = 2 * i + 1;
    int right = 2 * i + 2;
    
    // Add comparison state
    steps.push_back("{" + heapToJson(heap, i) + 
                   ",\"status\":\"Heapifying at index " + std::to_string(i) + "\"}");
    
    // Compare with left child
    if (left < n) {
        steps.push_back("{" + heapToJson(heap, i, left) + 
                       ",\"status\":\"Comparing " + std::to_string(heap[i]) + " with left child " + 
                       std::to_string(heap[left]) + "\"}");
                       
        if (heap[left] > heap[largest]) {
            largest = left;
            steps.push_back("{" + heapToJson(heap, largest) + 
                           ",\"status\":\"Left child is larger, updating largest to index " + std::to_string(largest) + "\"}");
        }
    }
    
    // Compare with right child
    if (right < n) {
        steps.push_back("{" + heapToJson(heap, largest, right) + 
                       ",\"status\":\"Comparing " + std::to_string(heap[largest]) + " with right child " + 
                       std::to_string(heap[right]) + "\"}");
                       
        if (heap[right] > heap[largest]) {
            largest = right;
            steps.push_back("{" + heapToJson(heap, largest) + 
                           ",\"status\":\"Right child is larger, updating largest to index " + std::to_string(largest) + "\"}");
        }
    }
    
    // If largest is not root
    if (largest != i) {
        steps.push_back("{" + heapToJson(heap, i, largest) + 
                       ",\"status\":\"Swapping " + std::to_string(heap[i]) + " with " + 
                       std::to_string(heap[largest]) + "\"}");
                       
        std::swap(heap[i], heap[largest]);
        
        steps.push_back("{" + heapToJson(heap, i, largest) + 
                       ",\"status\":\"Swapped elements, now heapifying the affected subtree\"}");
                       
        // Recursively heapify the affected sub-tree
        heapifyWithVisualization(heap, n, largest, steps);
    } else {
        steps.push_back("{" + heapToJson(heap, i) + 
                       ",\"status\":\"Node at index " + std::to_string(i) + " is already a max heap\"}");
    }
}

// Build max heap for visualization
void buildHeapWithVisualization(std::vector<int>& heap, std::vector<std::string>& steps) {
    int n = heap.size();
    
    // Add initial state
    steps.push_back("{" + heapToJson(heap) + 
                   ",\"status\":\"Starting to build max heap from array\"}");
    
    // Start from the last non-leaf node
    for (int i = n / 2 - 1; i >= 0; i--) {
        steps.push_back("{" + heapToJson(heap, i) + 
                       ",\"status\":\"Processing node at index " + std::to_string(i) + "\"}");
                       
        heapifyWithVisualization(heap, n, i, steps);
    }
    
    // Add final state
    steps.push_back("{" + heapToJson(heap) + 
                   ",\"status\":\"Max heap built successfully\"}");
}

// Heap insert operation
std::vector<std::string> heapInsert(int value) {
    std::vector<std::string> steps;
    
    // Add initial state
    steps.push_back("{" + heapToJson(heapArray) + 
                   ",\"status\":\"Starting insertion of " + std::to_string(value) + "\"}");
    
    // Insert the new element at the end
    heapArray.push_back(value);
    
    steps.push_back("{" + heapToJson(heapArray, heapArray.size() - 1) + 
                   ",\"status\":\"Inserted " + std::to_string(value) + " at the end of heap\"}");
    
    // Fix the max heap property
    int i = static_cast<int>(heapArray.size()) - 1;
    
    // Bubble up the new element
    while (i > 0) {
        int parent = (i - 1) / 2;
        
        steps.push_back("{" + heapToJson(heapArray, i, parent) + 
                       ",\"status\":\"Comparing " + std::to_string(heapArray[i]) + " with parent " + 
                       std::to_string(heapArray[parent]) + "\"}");
                       
        if (heapArray[i] <= heapArray[parent]) {
            steps.push_back("{" + heapToJson(heapArray, i) + 
                           ",\"status\":\"Heap property satisfied, stopping\"}");
            break;
        }
        
        steps.push_back("{" + heapToJson(heapArray, i, parent) + 
                       ",\"status\":\"Child is greater than parent, swapping\"}");
                       
        std::swap(heapArray[i], heapArray[parent]);
        
        steps.push_back("{" + heapToJson(heapArray, parent) + 
                       ",\"status\":\"Swapped " + std::to_string(heapArray[parent]) + " with " + 
                       std::to_string(heapArray[i]) + "\"}");
                       
        i = parent;
    }
    
    // Final state
    steps.push_back("{" + heapToJson(heapArray) + 
                   ",\"status\":\"Insertion complete, heap property restored\"}");
    
    return steps;
}

// Heap extract max operation
std::vector<std::string> heapExtractMax() {
    std::vector<std::string> steps;
    
    // Add initial state
    steps.push_back("{" + heapToJson(heapArray) + 
                   ",\"status\":\"Starting extract max operation\"}");
    
    // If heap is empty
    if (heapArray.empty()) {
        steps.push_back("{\"heap\":[],\"status\":\"Heap is empty, nothing to extract\"}");
        return steps;
    }
    
    // Get the maximum (root)
    int maxValue = heapArray[0];
    
    steps.push_back("{" + heapToJson(heapArray, 0) + 
                   ",\"status\":\"Maximum value is " + std::to_string(maxValue) + " (at root)\"}");
    
    // Replace root with the last element
    heapArray[0] = heapArray.back();
    heapArray.pop_back();
    
    if (!heapArray.empty()) {
        steps.push_back("{" + heapToJson(heapArray, 0) + 
                       ",\"status\":\"Replaced root with last element " + std::to_string(heapArray[0]) + "\"}");
                       
        // Heapify to restore max heap property
        heapifyWithVisualization(heapArray, heapArray.size(), 0, steps);
    } else {
        steps.push_back("{\"heap\":[],\"status\":\"Heap is now empty\"}");
    }
    
    // Final state
    steps.push_back("{" + heapToJson(heapArray) + 
                   ",\"status\":\"Extracted " + std::to_string(maxValue) + ", heap property restored\"}");
    
    return steps;
}

// Create a new heap from an array
std::vector<std::string> createHeap(const std::vector<int>& array) {
    std::vector<std::string> steps;
    
    // Add initial state
    steps.push_back("{\"heap\":[],\"status\":\"Creating new heap from array\"}");
    
    // Copy array to heap
    heapArray = array;
    
    steps.push_back("{" + heapToJson(heapArray) + 
                   ",\"status\":\"Copied array to heap, now building max heap\"}");
    
    // Build max heap
    buildHeapWithVisualization(heapArray, steps);
    
    return steps;
}

// Clear the heap
std::vector<std::string> clearHeap() {
    std::vector<std::string> steps;
    
    // Add initial state
    steps.push_back("{" + heapToJson(heapArray) + 
                   ",\"status\":\"Clearing the heap\"}");
    
    // Clear the heap
    heapArray.clear();
    
    // Final state
    steps.push_back("{\"heap\":[],\"status\":\"Heap cleared\"}");
    
    return steps;
}

#endif // HEAP_H