#ifndef TREE_H
#define TREE_H

#include <vector>
#include <string>
#include <sstream>
#include <queue>
#include <algorithm>
#include <memory>

// Binary Search Tree Node
struct TreeNode {
    int value;
    std::shared_ptr<TreeNode> left;
    std::shared_ptr<TreeNode> right;
    
    TreeNode(int val) : value(val), left(nullptr), right(nullptr) {}
};

// Global BST root for visualization
static std::shared_ptr<TreeNode> bstRoot = nullptr;

// Convert tree to JSON for visualization
std::string treeToJson(std::shared_ptr<TreeNode> root, int highlightValue = -1, bool isFound = false) {
    if (!root) {
        return "null";
    }
    
    std::ostringstream json;
    json << "{";
    json << "\"value\":" << root->value << ",";
    json << "\"highlight\":" << (root->value == highlightValue ? "true" : "false") << ",";
    json << "\"found\":" << (isFound && root->value == highlightValue ? "true" : "false") << ",";
    json << "\"left\":" << treeToJson(root->left, highlightValue, isFound) << ",";
    json << "\"right\":" << treeToJson(root->right, highlightValue, isFound);
    json << "}";
    
    return json.str();
}

// BST Insert operation
std::vector<std::string> bstInsert(int value) {
    std::vector<std::string> steps;
    
    // Add initial state
    steps.push_back("{\"tree\":" + treeToJson(bstRoot) + ",\"status\":\"Starting insertion of " + std::to_string(value) + "\"}");
    
    // If tree is empty, create new root
    if (!bstRoot) {
        bstRoot = std::make_shared<TreeNode>(value);
        steps.push_back("{\"tree\":" + treeToJson(bstRoot, value) + ",\"status\":\"Created new tree with root " + std::to_string(value) + "\"}");
        return steps;
    }
    
    // Traverse the tree to find insertion point
    std::shared_ptr<TreeNode> current = bstRoot;
    std::shared_ptr<TreeNode> parent = nullptr;
    
    while (current) {
        parent = current;
        
        // Add current comparison state
        steps.push_back("{\"tree\":" + treeToJson(bstRoot, current->value) + 
                       ",\"status\":\"Comparing " + std::to_string(value) + " with " + std::to_string(current->value) + "\"}");
        
        if (value < current->value) {
            current = current->left;
            steps.push_back("{\"tree\":" + treeToJson(bstRoot, parent->value) + 
                           ",\"status\":\"" + std::to_string(value) + " < " + std::to_string(parent->value) + ", moving to left child\"}");
        } else {
            current = current->right;
            steps.push_back("{\"tree\":" + treeToJson(bstRoot, parent->value) + 
                           ",\"status\":\"" + std::to_string(value) + " >= " + std::to_string(parent->value) + ", moving to right child\"}");
        }
    }
    
    // Insert the new node
    if (value < parent->value) {
        parent->left = std::make_shared<TreeNode>(value);
        steps.push_back("{\"tree\":" + treeToJson(bstRoot, value) + 
                       ",\"status\":\"Inserted " + std::to_string(value) + " as left child of " + std::to_string(parent->value) + "\"}");
    } else {
        parent->right = std::make_shared<TreeNode>(value);
        steps.push_back("{\"tree\":" + treeToJson(bstRoot, value) + 
                       ",\"status\":\"Inserted " + std::to_string(value) + " as right child of " + std::to_string(parent->value) + "\"}");
    }
    
    // Final state
    steps.push_back("{\"tree\":" + treeToJson(bstRoot) + ",\"status\":\"Insertion complete\"}");
    
    return steps;
}

// BST Search operation
std::vector<std::string> bstSearch(int value) {
    std::vector<std::string> steps;
    
    // Add initial state
    steps.push_back("{\"tree\":" + treeToJson(bstRoot) + ",\"status\":\"Starting search for " + std::to_string(value) + "\"}");
    
    // If tree is empty
    if (!bstRoot) {
        steps.push_back("{\"tree\":null,\"status\":\"Tree is empty, value not found\"}");
        return steps;
    }
    
    // Traverse the tree to find the value
    std::shared_ptr<TreeNode> current = bstRoot;
    
    while (current) {
        // Add current comparison state
        steps.push_back("{\"tree\":" + treeToJson(bstRoot, current->value) + 
                       ",\"status\":\"Comparing " + std::to_string(value) + " with " + std::to_string(current->value) + "\"}");
        
        if (value == current->value) {
            // Value found
            steps.push_back("{\"tree\":" + treeToJson(bstRoot, current->value, true) + 
                           ",\"status\":\"Found " + std::to_string(value) + " in the tree\"}");
            return steps;
        } else if (value < current->value) {
            current = current->left;
            if (current) {
                steps.push_back("{\"tree\":" + treeToJson(bstRoot, current->value) + 
                               ",\"status\":\"" + std::to_string(value) + " < " + std::to_string(current->value) + ", moving to left child\"}");
            }
        } else {
            current = current->right;
            if (current) {
                steps.push_back("{\"tree\":" + treeToJson(bstRoot, current->value) + 
                               ",\"status\":\"" + std::to_string(value) + " > " + std::to_string(current->value) + ", moving to right child\"}");
            }
        }
    }
    
    // Value not found
    steps.push_back("{\"tree\":" + treeToJson(bstRoot) + ",\"status\":\"" + std::to_string(value) + " not found in the tree\"}");
    
    return steps;
}

// Find minimum value node (used for deletion)
std::shared_ptr<TreeNode> findMinValueNode(std::shared_ptr<TreeNode> node) {
    std::shared_ptr<TreeNode> current = node;
    
    // Find the leftmost leaf
    while (current && current->left) {
        current = current->left;
    }
    
    return current;
}

// Helper function for BST deletion
std::shared_ptr<TreeNode> deleteNodeHelper(std::shared_ptr<TreeNode> root, int value, std::vector<std::string>& steps) {
    // Base case
    if (!root) {
        return nullptr;
    }
    
    // Add current node consideration
    steps.push_back("{\"tree\":" + treeToJson(bstRoot, root->value) + 
                   ",\"status\":\"Examining node " + std::to_string(root->value) + "\"}");
    
    // Recursively delete
    if (value < root->value) {
        steps.push_back("{\"tree\":" + treeToJson(bstRoot, root->value) + 
                       ",\"status\":\"" + std::to_string(value) + " < " + std::to_string(root->value) + ", moving to left subtree\"}");
        root->left = deleteNodeHelper(root->left, value, steps);
    } else if (value > root->value) {
        steps.push_back("{\"tree\":" + treeToJson(bstRoot, root->value) + 
                       ",\"status\":\"" + std::to_string(value) + " > " + std::to_string(root->value) + ", moving to right subtree\"}");
        root->right = deleteNodeHelper(root->right, value, steps);
    } else {
        // Node to be deleted found
        steps.push_back("{\"tree\":" + treeToJson(bstRoot, root->value, true) + 
                       ",\"status\":\"Found node to delete: " + std::to_string(root->value) + "\"}");
        
        // Case 1: No child or only one child
        if (!root->left) {
            std::shared_ptr<TreeNode> temp = root->right;
            steps.push_back("{\"tree\":" + treeToJson(bstRoot, root->value) + 
                           ",\"status\":\"Node " + std::to_string(root->value) + " has no left child, replacing with right child\"}");
            return temp;
        } else if (!root->right) {
            std::shared_ptr<TreeNode> temp = root->left;
            steps.push_back("{\"tree\":" + treeToJson(bstRoot, root->value) + 
                           ",\"status\":\"Node " + std::to_string(root->value) + " has no right child, replacing with left child\"}");
            return temp;
        }
        
        // Case 2: Two children
        steps.push_back("{\"tree\":" + treeToJson(bstRoot, root->value) + 
                       ",\"status\":\"Node " + std::to_string(root->value) + " has two children, finding successor\"}");
        
        // Find inorder successor
        std::shared_ptr<TreeNode> temp = findMinValueNode(root->right);
        steps.push_back("{\"tree\":" + treeToJson(bstRoot, temp->value) + 
                       ",\"status\":\"Inorder successor is " + std::to_string(temp->value) + "\"}");
        
        // Copy successor value
        root->value = temp->value;
        steps.push_back("{\"tree\":" + treeToJson(bstRoot, root->value) + 
                       ",\"status\":\"Replaced value with successor " + std::to_string(root->value) + "\"}");
        
        // Delete the successor
        steps.push_back("{\"tree\":" + treeToJson(bstRoot, temp->value) + 
                       ",\"status\":\"Now deleting the successor node " + std::to_string(temp->value) + " from right subtree\"}");
        root->right = deleteNodeHelper(root->right, temp->value, steps);
    }
    
    return root;
}

// BST Delete operation
std::vector<std::string> bstDelete(int value) {
    std::vector<std::string> steps;
    
    // Add initial state
    steps.push_back("{\"tree\":" + treeToJson(bstRoot) + ",\"status\":\"Starting deletion of " + std::to_string(value) + "\"}");
    
    // If tree is empty
    if (!bstRoot) {
        steps.push_back("{\"tree\":null,\"status\":\"Tree is empty, nothing to delete\"}");
        return steps;
    }
    
    // Delete the node
    bstRoot = deleteNodeHelper(bstRoot, value, steps);
    
    // Final state
    steps.push_back("{\"tree\":" + treeToJson(bstRoot) + ",\"status\":\"Deletion complete\"}");
    
    return steps;
}

// Clear the BST
std::vector<std::string> bstClear() {
    std::vector<std::string> steps;
    
    // Add initial state
    steps.push_back("{\"tree\":" + treeToJson(bstRoot) + ",\"status\":\"Clearing the tree\"}");
    
    // Clear the tree
    bstRoot = nullptr;
    
    // Final state
    steps.push_back("{\"tree\":null,\"status\":\"Tree cleared\"}");
    
    return steps;
}

#endif // TREE_H