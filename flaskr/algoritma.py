import numpy as np
from numpy import inf


class AntColonyOptimization():
    def __init__(self, routes_matrix, ants, iteration=100, evaporation_rate=0.1, alpha=0.1, beta=0.1):
        self.d = routes_matrix
        self.ants = ants
        self.iteration = iteration
        self.evaporation_rate = evaporation_rate
        self.alpha = alpha
        self.beta = beta
        self.reset()

    def reset(self):
        self.visibility = 1/self.d
        self.visibility[self.visibility == inf] = 0

        self.pheromne = .1*np.ones((self.ants, len(self.d)))

        self.routes = np.ones((self.iteration, self.ants, len(self.d)+1))
        self.best_route = np.ones(len(self.d))

        self.distances = np.zeros((self.iteration, self.ants))
        self.distance_matrix = np.zeros((self.iteration))
        self.best_distance_matrix = np.zeros(self.iteration)
        self.best_distance = 0

    def run(self):
        route = np.ones((self.ants, len(self.d)+1))
        citys = len(self.d)
        for ite in range(self.iteration):
            route[:, 0] = 1
            for i in range(self.ants):
                temp_visibility = np.array(self.visibility)
                for j in range(citys - 1):
                    combine_feature = np.zeros(citys)
                    cum_prob = np.zeros(citys)
                    cur_loc = int(route[i, j]-1)
                    temp_visibility[:, cur_loc] = 0

                    p_feature = np.power(self.pheromne[cur_loc, :], self.beta)
                    v_feature = np.power(
                        temp_visibility[cur_loc, :], self.alpha)

                    p_feature = p_feature[:, np.newaxis]
                    v_feature = v_feature[:, np.newaxis]

                    combine_feature = np.multiply(p_feature, v_feature)

                    total = np.sum(combine_feature)
                    probs = combine_feature/total

                    cum_prob = np.cumsum(probs)
                    r = np.random.random_sample()
                    city = np.nonzero(cum_prob > r)[0][0]+1

                    route[i, j+1] = city

                left = list(set([i for i in range(1, citys + 1)]) -
                            set(route[i, :-2]))[0]
                route[i, -2] = left

            rute_opt = np.array(route)
            self.routes[ite] = rute_opt
            self.calculate_distance(ite)
            self.calculate_pheromone(self.distances[ite], ite)

        return self.best_route, self.best_distance

    def calculate_distance(self, iteration):
        dist_cost = np.zeros(self.ants)

        for i in range(self.ants):
            s = 0
            for j in range(len(self.d)-1):
                s = s + self.d[int(self.routes[iteration, i, j])-1,
                               int(self.routes[iteration, i, j+1])-1]
            dist_cost[i] = s
        dist_min_loc = np.argmin(dist_cost)
        dist_min_cost = dist_cost[dist_min_loc]

        self.distances[iteration] = dist_cost
        self.distance_matrix[iteration] = dist_min_cost
        if self.best_distance == 0 or dist_min_cost < self.best_distance:
            self.best_distance_matrix[iteration] = dist_min_cost
            self.best_distance = dist_min_cost
            self.best_route = self.routes[iteration, dist_min_loc]
        else:
            self.best_distance_matrix[iteration] = self.best_distance

    def calculate_pheromone(self, dist_cost, iteration):
        # evaporation of pheromne with (1-e)
        self.pheromne = (1-self.evaporation_rate)*self.pheromne

        for i in range(self.ants):
            for j in range(len(self.d)-1):
                dt = 1/dist_cost[i]
                self.pheromne[int(self.routes[iteration, i, j])-1, int(self.routes[iteration, i, j+1]) -
                              1] = self.pheromne[int(self.routes[iteration, i, j])-1, int(self.routes[iteration, i, j+1])-1] + dt
