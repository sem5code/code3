import numpy as np, pandas as pd
from sklearn.cluster import KMeans
from sklearn.mixture import GaussianMixture
from sklearn.preprocessing import StandardScaler
import matplotlib.pyplot as plt

data = pd.DataFrame({
    'Age':[25,34,45,52,23,43,36,57,62,48],
    'BP':[120,130,140,150,110,145,135,155,160,142],
    'Chol':[200,210,230,250,190,240,220,260,270,235]
})

X = StandardScaler().fit_transform(data)

kmeans = KMeans(n_clusters=2, random_state=42)
data['KMeans'] = kmeans.fit_predict(X)

em = GaussianMixture(n_components=2, random_state=42)
data['EM'] = em.fit_predict(X)

print(data)

plt.scatter(data['Age'], data['Chol'], c=data['KMeans'], cmap='cool', label='K-Means')
plt.scatter(data['Age'], data['Chol'], c=data['EM'], cmap='autumn', marker='x', label='EM')
plt.xlabel('Age'); plt.ylabel('Cholesterol')
plt.title('Patient Clustering: K-Means vs EM')
plt.legend(); plt.show()
