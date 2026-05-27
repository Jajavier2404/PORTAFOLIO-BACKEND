import axios from 'axios';

const GITHUB_API_BASE = 'https://api.github.com';

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  topics: string[];
  created_at: string;
  updated_at: string;
  owner: {
    login: string;
  };
}

export class GitHubService {
  private username: string;

  constructor(username: string) {
    this.username = username;
  }

  async getRepositories(): Promise<GitHubRepo[]> {
    try {
      const response = await axios.get(
        `${GITHUB_API_BASE}/users/${this.username}/repos`,
        {
          params: {
            sort: 'updated',
            direction: 'desc',
            per_page: 100
          },
          headers: {
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      );

      return response.data.filter((repo: GitHubRepo) => !repo.fork);
    } catch (error) {
      console.error('Error fetching GitHub repos:', error);
      throw new Error('Error al obtener repositorios de GitHub');
    }
  }

  async getRepositoryDetails(owner: string, repo: string): Promise<GitHubRepo> {
    try {
      const response = await axios.get(
        `${GITHUB_API_BASE}/repos/${owner}/${repo}`,
        {
          headers: {
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error fetching repo details:', error);
      throw new Error('Error al obtener detalles del repositorio');
    }
  }

  async getRepositoryLanguages(owner: string, repo: string): Promise<Record<string, number>> {
    try {
      const response = await axios.get(
        `${GITHUB_API_BASE}/repos/${owner}/${repo}/languages`,
        {
          headers: {
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error fetching repo languages:', error);
      return {};
    }
  }
}
